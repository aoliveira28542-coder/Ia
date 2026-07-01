const fs = require("fs");
const path = require("path");

const Q = "app/jobs/queue";
const DB = "app/jobs/db/jobs.json";
const DONE = "app/jobs/done";
const OUT = "app/jobs/output";

[Q, DB, DONE, OUT].forEach(p=>{
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB)); }
  catch(e){ return {}; }
}

function saveDB(d){
  fs.writeFileSync(DB, JSON.stringify(d,null,2));
}

let db = loadDB();

const files = fs.readdirSync(Q);

for(const file of files){
  const job = JSON.parse(fs.readFileSync(path.join(Q,file)));

  console.log("[PROCESS]", job.id);

  job.status = "done";
  job.progress = 100;

  db[job.id] = job;

  saveDB(db);

  fs.writeFileSync(path.join(DONE,file), JSON.stringify(job,null,2));
  fs.writeFileSync(path.join(OUT,job.id+".txt"), job.prompt);

  fs.unlinkSync(path.join(Q,file));

  console.log("[DONE]", job.id);
}

console.log("=== CLEAN ENGINE COMPLETE ===");
