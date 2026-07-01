const express = require("express");
const app = express();

app.use(express.json());

global.queue = [];
global.results = {};

app.get("/metrics",(req,res)=>{
  res.json({ok:true, queue:global.queue.length});
});

app.post("/generate",(req,res)=>{
  const job = {
    id: Date.now().toString(),
    prompt: req.body?.prompt,
    status:"queued"
  };

  global.queue.push(job);
  res.json({ok:true, jobId:job.id});
});

app.listen(3000,()=>console.log("API RUNNING"));
