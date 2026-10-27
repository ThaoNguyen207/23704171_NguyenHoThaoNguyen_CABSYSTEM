// Structured logger for microservices
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function createLogger(serviceName, color = 'cyan') {
  const serviceColor = colors[color] || colors.cyan;

  function formatTime() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  return {
    info(...args) {
      console.log(`${colors.dim}[${formatTime()}]${colors.reset} ${serviceColor}[${serviceName}]${colors.reset} ${colors.green}INFO${colors.reset}`, ...args);
    },
    warn(...args) {
      console.warn(`${colors.dim}[${formatTime()}]${colors.reset} ${serviceColor}[${serviceName}]${colors.reset} ${colors.yellow}WARN${colors.reset}`, ...args);
    },
    error(...args) {
      console.error(`${colors.dim}[${formatTime()}]${colors.reset} ${serviceColor}[${serviceName}]${colors.reset} ${colors.red}ERROR${colors.reset}`, ...args);
    },
    debug(...args) {
      if (process.env.DEBUG) {
        console.log(`${colors.dim}[${formatTime()}]${colors.reset} ${serviceColor}[${serviceName}]${colors.reset} ${colors.dim}DEBUG${colors.reset}`, ...args);
      }
    }
  };
}

module.exports = { createLogger };
