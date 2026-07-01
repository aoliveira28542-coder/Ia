"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEvent = exports.AssetType = exports.JobStatus = void 0;
exports.JobStatus = {
    queued: 'queued',
    processing: 'processing',
    done: 'done',
    failed: 'failed',
    cancelled: 'cancelled',
};
exports.AssetType = {
    input_image: 'input_image',
    generated_video: 'generated_video',
    thumbnail: 'thumbnail',
    audio: 'audio',
    subtitle: 'subtitle',
};
exports.WebhookEvent = {
    jobdone: 'job.done',
    jobfailed: 'job.failed',
    joball: 'job.all',
};
