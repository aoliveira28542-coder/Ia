const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const QUEUE = path.join(__dirname, "../jobs/queue");
const DONE = path.join(__dirname, "../jobs/done");

// cria job (salva em disco = persistente)
app.post("/job", (req,res)=>{
  const id = Date.now().toString();
  const job = { id, prompt: req.body.prompt, status: "queued" };

  fs.writeFileSync(`${QUEUE}/${id}.json`, JSON.stringify(job,null,2));
  res.json(job);
});

// lista jobs
app.get("/jobs", (req,res)=>{
  const files = fs.readdirSync(QUEUE);
  const jobs = files.map(f =>
    JSON.parse(fs.readFileSync(path.join(QUEUE,f)))
  );
  res.json({ queue: jobs.length, jobs });
});

// worker simples embutido (sem background externo)
async function worker(){
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  while(true){
    const files = fs.readdirSync(QUEUE);

    if(files.length === 0){
      await sleep(1000);
      continue;
    }

    const file = files[0];
    const filePath = path.join(QUEUE,file);

    const job = JSON.parse(fs.readFileSync(filePath));

    console.log("[WORKING]", job.id);

    await sleep(1500);

    job.status = "done";

    fs.writeFileSync(
      path.join(DONE,file),
      JSON.stringify(job,null,2)
    );

    fs.unlinkSync(filePath);

    console.log("[DONE]", job.id);
  }
}

worker();

app.listen(3008, ()=>{
  console.log("BETA MVP ONLINE :3008");
});
