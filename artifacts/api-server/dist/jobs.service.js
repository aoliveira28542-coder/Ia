"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJob = exports.createJob = void 0;
const queue_js_1 = require("./queue.js");
const createJob = (payload) => {
    const job = {
        id: crypto.randomUUID(),
        status: "pending",
        payload,
        createdAt: Date.now()
    };
    (0, queue_js_1.addJob)(job);
    return job;
};
exports.createJob = createJob;
const fetchJob = (id) => (0, queue_js_1.getJob)(id);
exports.fetchJob = fetchJob;
