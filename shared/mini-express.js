const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

function pathToRegex(pathPattern) {
  // Convert /api/trips/:tripId/status into regex with parameter names
  const paramNames = [];
  const regexStr = pathPattern
    .replace(/\/+/g, '/')
    .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^\\/]+)';
    });

  const regex = new RegExp(`^${regexStr}\\/?$`);
  return { regex, paramNames };
}

function createApp() {
  const routes = [];
  const middlewares = [];

  function use(...args) {
    if (args.length === 1 && typeof args[0] === 'function') {
      middlewares.push({ fn: args[0] });
    } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'function') {
      middlewares.push({ prefix: args[0], fn: args[1] });
    }
  }

  function addRoute(method, pathPattern, ...handlers) {
    const { regex, paramNames } = pathToRegex(pathPattern);
    routes.push({
      method: method.toUpperCase(),
      pathPattern,
      regex,
      paramNames,
      handlers
    });
  }

  const app = {
    use,
    get: (path, ...handlers) => addRoute('GET', path, ...handlers),
    post: (path, ...handlers) => addRoute('POST', path, ...handlers),
    patch: (path, ...handlers) => addRoute('PATCH', path, ...handlers),
    put: (path, ...handlers) => addRoute('PUT', path, ...handlers),
    delete: (path, ...handlers) => addRoute('DELETE', path, ...handlers),
    options: (path, ...handlers) => addRoute('OPTIONS', path, ...handlers)
  };

  async function handleRequest(req, res) {
    // Enable CORS by default
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    req.path = parsedUrl.pathname;
    req.query = parsedUrl.query || {};
    req.params = {};

    // Response helper methods
    res.status = function (statusCode) {
      res.statusCode = statusCode;
      return res;
    };

    res.json = function (data) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(data));
      return res;
    };

    res.send = function (data) {
      if (typeof data === 'object') {
        return res.json(data);
      }
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      res.end(data);
      return res;
    };

    res.sendFile = function (filePath, contentType) {
      try {
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          return res.json({ error: 'File Not Found' });
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.yaml': 'text/yaml; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        const mime = contentType || mimeTypes[ext] || 'text/plain';
        res.setHeader('Content-Type', mime);
        const content = fs.readFileSync(filePath);
        res.writeHead(200);
        res.end(content);
      } catch (err) {
        res.statusCode = 500;
        res.json({ error: 'Internal Server Error', message: err.message });
      }
    };

    // Parse Body if POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString('utf8');
        if (rawBody) {
          try {
            req.body = JSON.parse(rawBody);
          } catch {
            req.body = rawBody;
          }
        } else {
          req.body = {};
        }
      } catch {
        req.body = {};
      }
    } else {
      req.body = {};
    }

    // Execute Middlewares
    let middlewareIndex = 0;
    async function nextMiddleware() {
      if (middlewareIndex < middlewares.length) {
        const mw = middlewares[middlewareIndex++];
        if (!mw.prefix || req.path.startsWith(mw.prefix)) {
          try {
            await mw.fn(req, res, nextMiddleware);
          } catch (err) {
            console.error('Middleware Error:', err);
            res.status(500).json({ error: 'Middleware error', message: err.message });
          }
        } else {
          await nextMiddleware();
        }
      } else {
        await matchAndExecuteRoute();
      }
    }

    // Match route
    async function matchAndExecuteRoute() {
      for (const route of routes) {
        if (route.method !== req.method && route.method !== 'ALL') {
          continue;
        }
        const match = req.path.match(route.regex);
        if (match) {
          req.params = {};
          route.paramNames.forEach((name, idx) => {
            req.params[name] = decodeURIComponent(match[idx + 1]);
          });

          let handlerIndex = 0;
          async function nextHandler() {
            if (handlerIndex < route.handlers.length) {
              const handler = route.handlers[handlerIndex++];
              try {
                await handler(req, res, nextHandler);
              } catch (err) {
                console.error(`Route handler error [${req.method} ${req.path}]:`, err);
                if (!res.writableEnded) {
                  res.status(500).json({ error: 'Internal Server Error', message: err.message });
                }
              }
            }
          }
          await nextHandler();
          return;
        }
      }

      // No route matched
      if (!res.writableEnded) {
        res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.path}` });
      }
    }

    await nextMiddleware();
  }

  app.listen = function (port, callback) {
    const server = http.createServer(handleRequest);
    return server.listen(port, callback);
  };

  return app;
}

module.exports = { createApp };
