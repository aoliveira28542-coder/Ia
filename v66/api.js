const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const JOBS="./jobs";
const RESULTS="./results";

app.get("/metrics",(req,res)=>{
  res.json({
    queue: fs.readdirSync(JOBS).length,
    results: fs.readdirSync(RESULTS).length,
    ok:true
  });
});

app.post("/generate",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt:req.body?.prompt,
    status:"queued"
  };

  fs.writeFileSync(`${JOBS}/${id}.json`, JSON.stringify(job));

  res.json({ok:true, jobId:id});
});

app.get("/result/:id",(req,res)=>{
  const file = `${RESULTS}/${req.params.id}.json`;

  if(!fs.existsSync(file)){
    return res.json({status:"processing"});
  }

  res.json(JSON.parse(fs.readFileSync(file)));
});

app.listen(3000,()=>console.log("V66 API RUNNING"));
