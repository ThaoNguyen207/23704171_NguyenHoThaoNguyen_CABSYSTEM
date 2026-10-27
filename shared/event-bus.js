const { EventEmitter } = require('node:events');
const { createLogger } = require('./logger');

const logger = createLogger('EventBus', 'magenta');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.history = [];
    this.setMaxListeners(50);
  }

  publish(eventName, data) {
    const event = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: eventName,
      data,
      timestamp: new Date().toISOString()
    };
    this.history.push(event);
    if (this.history.length > 500) {
      this.history.shift();
    }
    logger.info(`Event Published: \x1b[35m${eventName}\x1b[0m`, JSON.stringify(data));
    this.emit(eventName, data);
    this.emit('*', event);
    return event;
  }

  subscribe(eventName, handler) {
    this.on(eventName, handler);
    return () => this.off(eventName, handler);
  }

  getRecentEvents(limit = 20) {
    return this.history.slice(-limit).reverse();
  }
}

// Global shared singleton within the process (can be distributed via webhook or redis)
const sharedBus = new EventBus();

module.exports = {
  EventBus,
  sharedBus
};
