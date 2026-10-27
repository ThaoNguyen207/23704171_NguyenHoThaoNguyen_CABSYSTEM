const http = require('node:http');
const url = require('node:url');

function createProxy(targetUrl) {
  const parsedTarget = url.parse(targetUrl);

  return function proxyMiddleware(req, res) {
    const options = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${parsedTarget.hostname}:${parsedTarget.port}`,
        'x-forwarded-for': req.socket.remoteAddress,
        'x-forwarded-proto': 'http'
      }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // Forward status and headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`Proxy error to ${targetUrl}:`, err.message);
      if (!res.writableEnded) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'BAD_GATEWAY',
          message: `Dịch vụ tại ${targetUrl} hiện không phản hồi. Vui lòng kiểm tra microservice tương ứng.`,
          detail: err.message
        }));
      }
    });

    // Forward request body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyStr));
        proxyReq.write(bodyStr);
        proxyReq.end();
      } else if (typeof req.body === 'string') {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(req.body));
        proxyReq.write(req.body);
        proxyReq.end();
      } else {
        proxyReq.end();
      }
    } else {
      proxyReq.end();
    }
  };
}

module.exports = { createProxy };
