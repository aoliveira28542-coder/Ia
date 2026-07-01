const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

// simple in-memory rate limit
const rate = {};

const LIMIT = 5; // req per window
const WINDOW = 10000;

function checkRate(key){
  const now = Date.now();
  if(!rate[key]) rate[key] = [];

  rate[key] = rate[key].filter(t => now - t < WINDOW);

  if(rate[key].length >= LIMIT) return false;

  rate[key].push(now);
  return true;
}

const DIRS = {
  jobs:"./jobs",
  processing:"./processing",
  done:"./done",
  failed:"./failed"
};

function list(dir){
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function count(dir){
  return list(dir).length;
}

// DASHBOARD
app.get("/status",(req,res)=>{
  res.json({
    queued: count(DIRS.jobs),
    processing: count(DIRS.processing),
    done: count(DIRS.done),
    failed: count(DIRS.failed),
    ok:true,
    version:"V70-SCALE"
  });
});

// CREATE JOB (with priority + api key)
app.post("/generate",(req,res)=>{

  const key = req.headers["x-api-key"] || "public";

  if(!checkRate(key)){
    return res.status(429).json({ok:false,error:"RATE_LIMIT"});
  }

  const id = Date.now().toString();

  const job = {
    id,
    prompt:req.body?.prompt,
    priority:req.body?.priority || "normal",
    status:"queued",
    createdAt:Date.now(),
    retry:0,
    key
  };

  fs.writeFileSync(`${DIRS.jobs}/${job.priority}_${id}.json`, JSON.stringify(job));

  res.json({ok:true, jobId:id});
});

// RESULT
app.get("/result/:id",(req,res)=>{

  const allDirs = [DIRS.done, DIRS.failed];

  for(const d of allDirs){
    const file = `${d}/${req.params.id}.json`;
    if(fs.existsSync(file)){
      return res.json(JSON.parse(fs.readFileSync(file)));
    }
  }

  res.json({status:"processing"});
});

app.listen(3000,()=>console.log("V70 API RUNNING"));
