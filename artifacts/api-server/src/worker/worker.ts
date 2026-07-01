import { dequeue } from "../store/memory";
import { processJob } from "./processor";

async function loop() {
  while (true) {
    const job = dequeue();

    if (!job) {
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    job.status = "running";

    try {
      const result = await processJob(job);
      job.status = "done";
      job.result = result;
    } catch (e) {
      job.status = "failed";
      job.result = String(e);
    }
  }
}

loop();
