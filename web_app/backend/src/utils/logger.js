/**
 * Simple structured logger for JSON output to console.
 * Singleton pattern to avoid dependency injection complexity.
 */

class Logger {
  constructor() {
    this.correlationId = null;
  }

  setCorrelationId(id) {
    this.correlationId = id;
  }

  clearCorrelationId() {
    this.correlationId = null;
  }

  debug(message, data = {}) {
    this.log('debug', message, data);
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }

  log(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    if (this.correlationId) {
      logEntry.correlationId = this.correlationId;
    }

    console.log(JSON.stringify(logEntry));
  }
}

// Singleton instance
const logger = new Logger();

module.exports = { logger };