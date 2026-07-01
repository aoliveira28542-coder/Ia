"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = require("../store/memory");
const processor_1 = require("./processor");
async function loop() {
    while (true) {
        const job = (0, memory_1.dequeue)();
        if (!job) {
            await new Promise(r => setTimeout(r, 200));
            continue;
        }
        job.status = "running";
        try {
            const result = await (0, processor_1.processJob)(job);
            job.status = "done";
            job.result = result;
        }
        catch (e) {
            job.status = "failed";
            job.result = String(e);
        }
    }
}
loop();
