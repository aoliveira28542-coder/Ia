const express = require("express");
const app = express();
app.use(express.json());

const queue = [];
const results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    queue:queue.length,
    results:Object.keys(results).length,
    version:"V60-FINAL"
  });
});

app.post("/generate",(req,res)=>{
  const job = {
    id: Date.now().toString(),
    prompt:req.body?.prompt,
    status:"queued"
  };

  queue.push(job);
  res.json({ok:true,jobId:job.id});
});

// WORKER INSIDE SAME PROCESS (FIX FINAL)
setInterval(()=>{
  const job = queue.find(j=>j.status==="queued");
  if(!job) return;

  job.status="done";

  results[job.id] = {
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"V60-FINAL-OK"
  };

  queue.splice(queue.indexOf(job),1);

},500);

app.get("/result/:id",(req,res)=>{
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(3000,()=>console.log("V60 RUNNING"));
