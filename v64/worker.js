setInterval(()=>{

  const job = global.queue?.find(j=>j.status==="queued");
  if(!job) return;

  job.status="done";

  global.results[job.id] = {
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"V64-OK"
  };

  global.queue = global.queue.filter(j=>j.id!==job.id);

},300);
