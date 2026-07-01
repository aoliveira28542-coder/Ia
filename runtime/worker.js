setInterval(()=>{
  if(global.queue === undefined) global.queue = [];
  if(global.results === undefined) global.results = {};

  const q = global.queue;
  const r = global.results;

  const job = q.find(j=>j.status==="queued");
  if(!job) return;

  job.status="done";
  r[job.id]={
    ok:true,
    id:job.id,
    prompt:job.prompt,
    result:"FINAL-STABLE-OK"
  };

  global.queue = q.filter(j=>j.id!==job.id);
},500);
