"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJob = exports.dequeue = exports.enqueue = exports.store = exports.queue = void 0;
exports.queue = [];
exports.store = new Map();
const enqueue = (job) => {
    exports.queue.push(job);
    exports.store.set(job.id, job);
};
exports.enqueue = enqueue;
const dequeue = () => exports.queue.shift();
exports.dequeue = dequeue;
const getJob = (id) => exports.store.get(id);
exports.getJob = getJob;
