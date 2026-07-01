const { read, write } = require("./store");

console.log("V57 WORKER ONLINE");

async function loop(){
  try {
    let queue = read("data/queue.json",[]);
    let results = read("data/results.json",{});

    const job = queue.find(j=>j.status==="queued");
    if(!job) return;

    job.status="processing";

    results[job.id]={
      ok:true,
      id:job.id,
      prompt:job.prompt,
      status:"done",
      result:"V57-BLIND-OK"
    };

    queue = queue.filter(j=>j.id!==job.id);

    write("data/queue.json",queue);
    write("data/results.json",results);

    console.log("DONE JOB",job.id);

  } catch(e){
    console.log("WORKER ERROR -> RESTART SAFE");
  }
}

setInterval(loop,500);
