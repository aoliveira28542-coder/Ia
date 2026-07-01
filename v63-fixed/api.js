const express = require("express");
const app = express();

app.use(express.json());

let queue = [];
let results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    version:"V63-FIXED",
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

setInterval(()=>{
  const job = queue.find(j=>j.status==="queued");
  if(!job) return;

  job.status = "done";

  results[job.id] = {
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"V63-FIXED-OK"
  };

  queue = queue.filter(j=>j.id !== job.id);
},500);

app.get("/result/:id",(req,res)=>{
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(3000,()=>console.log("V63 FIXED RUNNING"));
