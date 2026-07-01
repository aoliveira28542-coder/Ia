const express = require("express");
const { read, write } = require("./store");

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/metrics",(req,res)=>{
  const queue = read("data/queue.json",[]);
  const results = read("data/results.json",{});

  res.json({
    ok:true,
    version:"V61-PROD",
    queue:queue.length,
    results:Object.keys(results).length
  });
});

app.post("/generate",(req,res)=>{
  const queue = read("data/queue.json",[]);

  const job = {
    id: Date.now().toString(),
    prompt:req.body?.prompt,
    status:"queued",
    attempts:0
  };

  queue.push(job);
  write("data/queue.json",queue);

  res.json({ok:true,jobId:job.id});
});

app.get("/result/:id",(req,res)=>{
  const results = read("data/results.json",{});
  res.json(results[req.params.id] || {ok:false,status:"processing"});
});

app.listen(PORT,()=>console.log("V61 API RUNNING"));
