const express = require("express");
const app = express();

app.use(express.json());

const queue = [];
const results = {};

app.get("/metrics",(req,res)=>{
  res.json({
    ok:true,
    version:"V60-CLEAN",
    queue:queue.length,
    results:Object.keys(results).length
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

setInterval(()=>{
  const job = queue.find(j=>j.status==="queued");
  if(!job) return;

  job.status="done";

  results[job.id] = {
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"V60-CLEAN-OK"
  };

  queue.splice(queue.indexOf(job),1);
},500);

app.get("/result/:id",(req,res)=>{
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(3000,()=>console.log("V60 CLEAN RUNNING"));
