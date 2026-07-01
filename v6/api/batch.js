const fs = require("fs");
const path = require("path");

const QUEUE = path.join(__dirname, "../jobs/queue");
const DB = path.join(__dirname, "../jobs/db/jobs.json");

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB)); }
  catch(e){ return {}; }
}

function saveDB(d){
  fs.writeFileSync(DB, JSON.stringify(d,null,2));
}

let jobs = loadDB();

// processa TODOS jobs uma vez e finaliza
const files = fs.readdirSync(QUEUE);

for(const file of files){
  const job = JSON.parse(fs.readFileSync(path.join(QUEUE,file)));

  jobs[job.id] = {
    ...job,
    status: "done",
    progress: 100
  };

  console.log("[DONE]", job.id);

  fs.unlinkSync(path.join(QUEUE,file));
}

saveDB(jobs);

console.log("BATCH COMPLETE");
