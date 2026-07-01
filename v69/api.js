const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const DIRS = {
  jobs:"./jobs",
  processing:"./processing",
  done:"./done",
  failed:"./failed"
};

const list = (dir)=>
  fs.existsSync(dir) ? fs.readdirSync(dir) : [];

function count(dir){
  return list(dir).length;
}

app.get("/metrics",(req,res)=>{
  res.json({
    queued: count(DIRS.jobs),
    processing: count(DIRS.processing),
    done: count(DIRS.done),
    failed: count(DIRS.failed),
    uptime: process.uptime(),
    ok:true,
    version:"V69-OBSERVABLE"
  });
});

app.post("/generate",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt:req.body?.prompt,
    status:"queued",
    createdAt:Date.now(),
    attempts:0
  };

  fs.writeFileSync(`${DIRS.jobs}/${id}.json`, JSON.stringify(job));

  res.json({ok:true, jobId:id});
});

app.get("/result/:id",(req,res)=>{
  const done = `${DIRS.done}/${req.params.id}.json`;
  const fail = `${DIRS.failed}/${req.params.id}.json`;

  if(fs.existsSync(done))
    return res.json(JSON.parse(fs.readFileSync(done)));

  if(fs.existsSync(fail))
    return res.json(JSON.parse(fs.readFileSync(fail)));

  res.json({status:"processing"});
});

app.listen(3000,()=>console.log("V69 API RUNNING"));
