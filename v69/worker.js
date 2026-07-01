const fs = require("fs");

const DIRS = {
  jobs:"./jobs",
  processing:"./processing",
  done:"./done",
  failed:"./failed"
};

const LOCK_TTL = 5000;
const MAX_ATTEMPTS = 3;

function list(dir){
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function safeMove(from,to){
  try {
    fs.renameSync(from,to);
    return true;
  } catch(e){
    return false;
  }
}

function isStuck(file){
  const stat = fs.statSync(file);
  return Date.now() - stat.mtimeMs > LOCK_TTL;
}

setInterval(()=>{

  const jobs = list(DIRS.jobs);
  const locked = list(DIRS.processing);

  // 🔥 WATCHDOG: recover stuck jobs
  for(const file of locked){
    const path = `${DIRS.processing}/${file}`;
    if(isStuck(path)){
      safeMove(path, `${DIRS.jobs}/${file}`);
    }
  }

  const all = list(DIRS.jobs);
  if(!all.length) return;

  const file = all[0];

  const jobPath = `${DIRS.jobs}/${file}`;
  const lockPath = `${DIRS.processing}/${file}`;

  if(!safeMove(jobPath, lockPath)) return;

  let job;

  try {
    job = JSON.parse(fs.readFileSync(lockPath));
  } catch(e){
    fs.unlinkSync(lockPath);
    return;
  }

  job.attempts++;

  try {

    // simulate processing
    const start = Date.now();
    while(Date.now() - start < 120) {}

    const result = {
      ok:true,
      id:job.id,
      prompt:job.prompt,
      result:"V69-OBSERVABLE-OK"
    };

    fs.writeFileSync(
      `${DIRS.done}/${job.id}.json`,
      JSON.stringify(result)
    );

    fs.unlinkSync(lockPath);

  } catch(e){

    if(job.attempts >= MAX_ATTEMPTS){
      fs.writeFileSync(
        `${DIRS.failed}/${job.id}.json`,
        JSON.stringify({ok:false,id:job.id,error:"FAILED"})
      );
      fs.unlinkSync(lockPath);
      return;
    }

    fs.writeFileSync(`${DIRS.jobs}/${job.id}.json`, JSON.stringify(job));
    fs.unlinkSync(lockPath);
  }

},200);

console.log("V69 WORKER RUNNING");
