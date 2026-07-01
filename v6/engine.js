const fs = require("fs");
const path = require("path");

const QUEUE = path.join(__dirname, "jobs/queue");
const DB = path.join(__dirname, "jobs/db/jobs.json");
const DONE = path.join(__dirname, "jobs/done");

// garante pastas (CRÍTICO)
[QUEUE, path.join(__dirname,"jobs/db"), DONE].forEach(p=>{
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB)); }
  catch(e){ return {}; }
}

function saveDB(db){
  fs.writeFileSync(DB, JSON.stringify(db,null,2));
}

let db = loadDB();

// se não tiver jobs, não crasha
let files = [];
try {
  files = fs.readdirSync(QUEUE);
} catch(e){
  console.log("QUEUE EMPTY OR MISSING");
  files = [];
}

if(files.length === 0){
  console.log("NO JOBS TO PROCESS");
  process.exit(0);
}

for(const file of files){
  const filePath = path.join(QUEUE,file);

  let job;

  try {
    job = JSON.parse(fs.readFileSync(filePath));
  } catch(e){
    console.log("CORRUPT JOB:", file);
    continue;
  }

  console.log("[PROCESS]", job.id);

  job.status = "done";

  db[job.id] = job;

  saveDB(db);

  fs.writeFileSync(path.join(DONE,file), JSON.stringify(job,null,2));

  fs.unlinkSync(filePath);

  console.log("[DONE]", job.id);
}

console.log("ENGINE COMPLETE");
