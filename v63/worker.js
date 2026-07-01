let queue = [];
let results = {};

function attach(sharedQueue, sharedResults){
  queue = sharedQueue;
  results = sharedResults;
}

setInterval(()=>{
  const job = queue.find(j=>j.status==="queued");
  if(!job) return;

  job.status = "done";

  results[job.id] = {
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"V63-REAL-WORKER-OK"
  };

  queue = queue.filter(j=>j.id !== job.id);
},500);

module.exports = { attach };
