"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJob = exports.getNextJob = exports.addJob = exports.queue = void 0;
exports.queue = [];
const addJob = (job) => exports.queue.push(job);
exports.addJob = addJob;
const getNextJob = () => {
    const job = exports.queue.find(j => j.status === "pending");
    if (!job)
        return null;
    job.status = "processing";
    return job;
};
exports.getNextJob = getNextJob;
const getJob = (id) => exports.queue.find(j => j.id === id);
exports.getJob = getJob;
