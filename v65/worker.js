const { Worker } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis({ host: "127.0.0.1", port: 6379 });

const worker = new Worker("jobs", async job => {
  return {
    ok:true,
    id: job.id,
    prompt: job.data.prompt,
    result: "V65-REAL-PROCESSED"
  };
}, { connection });

console.log("V65 WORKER RUNNING");
