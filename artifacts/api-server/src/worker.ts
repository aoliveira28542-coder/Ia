
import { getNextJob } from './queue.js';

console.log("V6 WORKER ONLINE");

setInterval(() => {
  const job = getNextJob();
  if (!job) return;

  try {
    job.result = {
      ok: true,
      processedAt: Date.now()
    };
    job.status = "done";
  } catch (err) {
    job.status = "failed";
    job.error = String(err);
  }
}, 1000);
