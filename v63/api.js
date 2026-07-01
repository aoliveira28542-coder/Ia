const express = require("express");
const app = express();

app.use(express.json());

let queue = [];
let results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    version:"V63-API",
    queue:queue.length,
    results:Object.keys(results).length
  });
});

app.post("/generate",(req,res)=>{
  const job = {
    id: Date.now().toString(),
    prompt: req.body?.prompt,
    status:"queued"
  };

  queue.push(job);

  res.json({ok:true, jobId:job.id});
});

app.get("/result/:id",(req,res)=>{
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(3000,()=>console.log("V63 API RUNNING"));
