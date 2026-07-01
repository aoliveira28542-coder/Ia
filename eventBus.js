const events = {
  queue: [],
  listeners: {}
};

function emit(event, data) {
  if (events.listeners[event]) {
    events.listeners[event].forEach(fn => fn(data));
  }
}

function on(event, fn) {
  if (!events.listeners[event]) {
    events.listeners[event] = [];
  }
  events.listeners[event].push(fn);
}

function push(job) {
  events.queue.push(job);
  emit("job:new", job);
}

function pop() {
  return events.queue.shift();
}

module.exports = { emit, on, push, pop };
