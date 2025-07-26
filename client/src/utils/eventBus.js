// Simple event bus for cross-component communication
const listeners = {};

export const eventBus = {
  on(event, cb) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
  },
  off(event, cb) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(fn => fn !== cb);
  },
  emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(fn => fn(data));
  }
};

export default eventBus;
