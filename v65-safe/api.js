const express = require("express");
const app = express();

app.use(express.json());

global.queue = [];
global.results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    queue: global.queue.length,
    results: Object.keys(global.results).length,
    version:"V65-SAFE"
  });
});

app.post("/generate",(req,res)=>{
  const job = {
    id: Date.now().toString(),
    prompt: req.body?.prompt,
    status:"queued"
  };

  global.queue.push(job);
  res.json({ok:true, jobId: job.id});
});

app.get("/result/:id",(req,res)=>{
  res.json(global.results[req.params.id] || {status:"processing"});
});

app.listen(3000,()=>console.log("V65 SAFE API RUNNING"));
