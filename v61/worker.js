const { read, write } = require("./store");

console.log("V61 WORKER ONLINE");

function process(){
  let queue = read("data/queue.json",[]);
  let results = read("data/results.json",{});

  const job = queue.find(j => j.status === "queued");

  if(!job) return;

  try {
    job.status = "processing";
    job.attempts++;

    results[job.id] = {
      ok:true,
      id:job.id,
      prompt:job.prompt,
      status:"done",
      result:"V61-PERSISTENT-OK"
    };

    queue = queue.filter(j => j.id !== job.id);

    write("data/queue.json",queue);
    write("data/results.json",results);

    console.log("DONE:", job.id);

  } catch (e) {
    job.status = "queued"; // retry safe
  }
}

setInterval(process, 500);
