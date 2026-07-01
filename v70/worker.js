const fs = require("fs");

const DIRS = {
  jobs:"./jobs",
  processing:"./processing",
  done:"./done",
  failed:"./failed"
};

function list(dir){
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function move(a,b){
  try {
    fs.renameSync(a,b);
    return true;
  } catch(e){
    return false;
  }
}

// priority sorter
function sortJobs(files){
  return files.sort((a,b)=>{
    if(a.startsWith("high_")) return -1;
    if(b.startsWith("high_")) return 1;
    if(a.startsWith("normal_")) return -1;
    if(b.startsWith("normal_")) return 1;
    return 0;
  });
}

setInterval(()=>{

  let jobs = list(DIRS.jobs);
  if(!jobs.length) return;

  jobs = sortJobs(jobs);

  const file = jobs[0];

  const jobPath = `${DIRS.jobs}/${file}`;
  const lockPath = `${DIRS.processing}/${file}`;

  if(!move(jobPath, lockPath)) return;

  let job;
  try {
    job = JSON.parse(fs.readFileSync(lockPath));
  } catch(e){
    fs.unlinkSync(lockPath);
    return;
  }

  job.retry++;

  try {

    // simulate processing load
    const start = Date.now();
    while(Date.now() - start < 80) {}

    const result = {
      ok:true,
      id:job.id,
      priority:job.priority,
      result:"V70-SCALE-OK"
    };

    fs.writeFileSync(
      `${DIRS.done}/${job.id}.json`,
      JSON.stringify(result)
    );

    fs.unlinkSync(lockPath);

  } catch(e){

    if(job.retry >= 3){
      fs.writeFileSync(
        `${DIRS.failed}/${job.id}.json`,
        JSON.stringify({ok:false,id:job.id,error:"FAILED"})
      );
      fs.unlinkSync(lockPath);
      return;
    }

    fs.writeFileSync(`${DIRS.jobs}/${file}`, JSON.stringify(job));
    fs.unlinkSync(lockPath);
  }

},150);

console.log("V70 WORKER RUNNING");
