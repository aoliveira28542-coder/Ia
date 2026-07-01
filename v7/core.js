const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const Q = path.join(__dirname, "jobs/queue");
const DB = path.join(__dirname, "jobs/db/jobs.json");
const DONE = path.join(__dirname, "jobs/done");
const LOG = path.join(__dirname, "logs/log.txt");

[Q, path.dirname(DB), DONE].forEach(p=>{
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

function log(msg){
  fs.appendFileSync(LOG, `[${Date.now()}] ${msg}\n`);
}

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB)); }
  catch(e){ return {}; }
}

function saveDB(d){
  fs.writeFileSync(DB, JSON.stringify(d,null,2));
}

// =====================
// V7 → V_END JOB CREATE
// =====================
app.post("/job",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt: req.body.prompt || "",
    priority: req.body.priority || 1,
    status: "queued",
    retries: 0,
    progress: 0
  };

  const db = loadDB();
  db[id] = job;
  saveDB(db);

  fs.writeFileSync(`${Q}/${id}.json`, JSON.stringify(job,null,2));

  res.json(job);
});

// =====================
// LIST
// =====================
app.get("/jobs",(req,res)=>{
  res.json(loadDB());
});

// =====================
// AUTO ENGINE (SAFE BATCH)
// =====================
app.post("/run",(req,res)=>{
  let db = loadDB();

  let files = fs.readdirSync(Q)
    .filter(f=>f.endsWith(".json"))
    .sort((a,b)=>{
      const ja = JSON.parse(fs.readFileSync(path.join(Q,a)));
      const jb = JSON.parse(fs.readFileSync(path.join(Q,b)));
      return (jb.priority||0)-(ja.priority||0);
    });

  let processed = [];

  for(const file of files){
    const filePath = path.join(Q,file);

    let job;
    try {
      job = JSON.parse(fs.readFileSync(filePath));
    } catch(e){
      continue;
    }

    log("PROCESS " + job.id);

    job.status = "done";
    job.progress = 100;

    db[job.id] = job;
    saveDB(db);

    fs.writeFileSync(path.join(DONE,file), JSON.stringify(job,null,2));
    fs.unlinkSync(filePath);

    processed.push(job.id);
  }

  log("RUN COMPLETE");

  res.json({ ok:true, processed });
});

// =====================
// RETRY SYSTEM (V8 CORE)
// =====================
app.post("/retry",(req,res)=>{
  const { id } = req.body;

  let db = loadDB();

  if(!db[id]){
    return res.json({ error:"not found" });
  }

  db[id].status = "queued";
  db[id].retries += 1;
  db[id].progress = 0;

  saveDB(db);

  fs.writeFileSync(`${Q}/${id}.json`, JSON.stringify(db[id],null,2));

  res.json({ ok:true, id });
});

// =====================
// HEALTH (V9 CORE)
// =====================
app.get("/health",(req,res)=>{
  const db = loadDB();
  res.json({
    status:"ok",
    jobs:Object.keys(db).length,
    time:Date.now()
  });
});

// =====================
// AUTO RUN MODE (V10)
// =====================
setInterval(()=>{
  try {
    const files = fs.readdirSync(Q);
    if(files.length === 0) return;

    let db = loadDB();

    for(const file of files){
      const job = JSON.parse(fs.readFileSync(path.join(Q,file)));

      job.status = "done";
      job.progress = 100;

      db[job.id] = job;

      fs.writeFileSync(path.join(DONE,file), JSON.stringify(job,null,2));
      fs.unlinkSync(path.join(Q,file));

      log("AUTO " + job.id);
    }

    saveDB(db);

  } catch(e){}
}, 3000);

// =====================
// START
// =====================
app.listen(3008, ()=>{
  console.log("V7→V_END SYSTEM ONLINE :3008");
  log("SYSTEM STARTED");
});
