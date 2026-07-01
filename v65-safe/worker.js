setInterval(()=>{
  const job = global.queue.find(j=>j.status==="queued");
  if(!job) return;

  job.status="done";

  global.results[job.id] = {
    ok:true,
    id: job.id,
    prompt: job.prompt,
    result:"V65-SAFE-OK"
  };

  global.queue = global.queue.filter(j=>j.id!==job.id);

},300);

console.log("V65 SAFE WORKER RUNNING");
