const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const QUEUE = path.join(__dirname, "../jobs/queue");

app.post("/job",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt: req.body.prompt,
    status: "queued"
  };

  fs.writeFileSync(`${QUEUE}/${id}.json`, JSON.stringify(job,null,2));

  res.json(job);
});

app.get("/jobs",(req,res)=>{
  const files = fs.readdirSync(QUEUE);

  const jobs = files.map(f =>
    JSON.parse(fs.readFileSync(path.join(QUEUE,f)))
  );

  res.json(jobs);
});

app.listen(3008, ()=>{
  console.log("V5 API READY :3008");
});
