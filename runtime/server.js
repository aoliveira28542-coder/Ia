const express = require("express");
const app = express();
app.use(express.json());

const queue = [];
const results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    queue: queue.length,
    results: Object.keys(results).length
  });
});

app.post("/generate",(req,res)=>{
  const job = {
    id: Date.now().toString(),
    prompt: req.body?.prompt,
    status:"queued"
  };
  queue.push(job);
  res.json({ok:true,jobId:job.id});
});

app.get("/result/:id",(req,res)=>{
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(3000,()=>console.log("FINAL SYSTEM RUNNING"));
