const express = require("express");
const { Queue } = require("bullmq");

const app = express();
app.use(express.json());

const connection = { host: "127.0.0.1", port: 6379 };
const queue = new Queue("jobs", { connection });

app.get("/metrics",(req,res)=>{
  res.json({ ok:true, version:"V62", status:"api-online" });
});

app.post("/generate", async (req,res)=>{
  const job = await queue.add("task", {
    prompt: req.body?.prompt
  });

  res.json({ ok:true, jobId: job.id });
});

app.listen(3000, ()=>console.log("V62 API RUNNING"));
