const { Worker } = require("bullmq");

const connection = { host: "127.0.0.1", port: 6379 };

console.log("V62 WORKER ONLINE");

const worker = new Worker("jobs", async job => {
  console.log("PROCESSING:", job.id);

  return {
    ok: true,
    id: job.id,
    prompt: job.data.prompt,
    result: "V62-REDIS-OK"
  };
}, { connection });
