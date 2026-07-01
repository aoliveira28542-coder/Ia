const express = require("express");
const { read, write } = require("./store");

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/metrics",(req,res)=>{
  const q = read("data/queue.json",[]);
  const r = read("data/results.json",{});

  res.json({
    ok:true,
    version:"V57-BLIND",
    queue:q.length,
    results:Object.keys(r).length
  });
});

app.post("/generate",(req,res)=>{
  const queue = read("data/queue.json",[]);

  const job = {
    id: Date.now().toString(),
    prompt: req.body?.prompt,
    status:"queued"
  };

  queue.push(job);
  write("data/queue.json",queue);

  res.json({ok:true,jobId:job.id});
});

app.listen(PORT,()=>console.log("V57 API RUNNING"));
