"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_js_1 = require("./queue.js");
console.log("V6 WORKER ONLINE");
setInterval(() => {
    const job = (0, queue_js_1.getNextJob)();
    if (!job)
        return;
    try {
        job.result = {
            ok: true,
            processedAt: Date.now()
        };
        job.status = "done";
    }
    catch (err) {
        job.status = "failed";
        job.error = String(err);
    }
}, 1000);
