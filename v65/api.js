const express = require("express");
const { Queue } = require("bullmq");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

const connection = new Redis({ host: "127.0.0.1", port: 6379 });

const queue = new Queue("jobs", { connection });

app.get("/metrics", async (req,res)=>{
  const count = await queue.count();
  res.json({ ok:true, queue: count, version:"V65-REDIS" });
});

app.post("/generate", async (req,res)=>{
  const job = await queue.add("process", {
    prompt: req.body?.prompt
  });

  res.json({ ok:true, jobId: job.id });
});

app.listen(3000, "0.0.0.0", ()=>{
  console.log("V65 API RUNNING");
});
