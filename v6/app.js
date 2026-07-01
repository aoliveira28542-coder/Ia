const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const QUEUE = path.join(__dirname, "jobs/queue");
const DB = path.join(__dirname, "jobs/db/jobs.json");
const DONE = path.join(__dirname, "jobs/done");

// garante pastas
[QUEUE, path.dirname(DB), DONE].forEach(p=>{
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

// DB helpers
function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB)); }
  catch(e){ return {}; }
}

function saveDB(db){
  fs.writeFileSync(DB, JSON.stringify(db,null,2));
}

// cria job
app.post("/job",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt: req.body.prompt || "",
    status: "queued",
    progress: 0
  };

  const db = loadDB();
  db[id] = job;
  saveDB(db);

  fs.writeFileSync(`${QUEUE}/${id}.json`, JSON.stringify(job,null,2));

  res.json(job);
});

// lista jobs
app.get("/jobs",(req,res)=>{
  res.json(loadDB());
});

// EXECUTOR (SEM LOOP INFINITO)
app.post("/run",(req,res)=>{
  const db = loadDB();

  const files = fs.readdirSync(QUEUE).filter(f=>f.endsWith(".json"));

  let processed = [];

  for(const file of files){
    const filePath = path.join(QUEUE,file);

    let job;
    try {
      job = JSON.parse(fs.readFileSync(filePath));
    } catch(e){
      continue;
    }

    job.status = "done";
    job.progress = 100;

    db[job.id] = job;

    fs.writeFileSync(path.join(DONE,file), JSON.stringify(job,null,2));
    fs.unlinkSync(filePath);

    processed.push(job.id);
  }

  saveDB(db);

  res.json({
    ok: true,
    processed
  });
});

// health
app.get("/health",(req,res)=>{
  res.json({
    status: "ok",
    time: Date.now(),
    jobs: Object.keys(loadDB()).length
  });
});

app.listen(3008, ()=>{
  console.log("V6 FINAL STABLE RUNNING :3008");
});
