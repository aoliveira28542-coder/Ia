"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJob = processJob;
async function processJob(job) {
    if (job.type === "video")
        return `video:${job.id}`;
    if (job.type === "image")
        return `image:${job.id}`;
    return { ok: true, id: job.id };
}
