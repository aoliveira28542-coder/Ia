const express = require("express");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const app = express();
app.use(express.json());

const JOBS = path.join(__dirname, "jobs");
const OUTPUT = path.join(__dirname, "output");
const LOG = path.join(__dirname, "logs/log.txt");

[JOBS, OUTPUT, path.join(__dirname,"scenes")].forEach(p=>{
  if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});
});

function log(msg){
  fs.appendFileSync(LOG, `[${Date.now()}] ${msg}\n`);
}

// =====================
// CREATE VIDEO JOB
// =====================
app.post("/video",(req,res)=>{
  const id = Date.now().toString();

  const job = {
    id,
    prompt: req.body.prompt || "empty",
    status: "queued",
    type: "video"
  };

  fs.writeFileSync(`${JOBS}/${id}.json`, JSON.stringify(job,null,2));

  res.json(job);
});

// =====================
// LIST JOBS
// =====================
app.get("/videos",(req,res)=>{
  const files = fs.readdirSync(JOBS).map(f =>
    JSON.parse(fs.readFileSync(path.join(JOBS,f)))
  );

  res.json(files);
});

// =====================
// RENDER ENGINE (SAFE RUN)
// =====================
app.post("/render",(req,res)=>{
  const files = fs.readdirSync(JOBS);

  let results = [];

  for(const file of files){
    const filePath = path.join(JOBS,file);
    const job = JSON.parse(fs.readFileSync(filePath));

    log("RENDER " + job.id);

    // =========================
    // SCENE GENERATION (V1)
    // =========================
    const sceneText = `
Scene 1: ${job.prompt}
Duration: 3s
Style: cinematic
`;

    const scenePath = path.join(__dirname,"scenes", job.id + ".txt");
    fs.writeFileSync(scenePath, sceneText);

    // =========================
    // VIDEO GENERATION
    // =========================
    const outputFile = path.join(OUTPUT, job.id + ".mp4");

    try {
      // tenta usar ffmpeg real
      execSync(`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=3 ${outputFile}`);
      job.status = "rendered_real";
    } catch(e){
      // fallback seguro (sem ffmpeg)
      fs.writeFileSync(outputFile.replace(".mp4",".txt"),
        "VIDEO SIMULADO: " + job.prompt
      );
      job.status = "rendered_simulated";
    }

    fs.unlinkSync(filePath);

    results.push(job.id);

    log("DONE " + job.id);
  }

  res.json({
    ok:true,
    rendered: results
  });
});

// =====================
// HEALTH
// =====================
app.get("/health",(req,res)=>{
  res.json({
    status:"ok",
    jobs: fs.readdirSync(JOBS).length,
    time: Date.now()
  });
});

app.listen(3009, ()=>{
  console.log("VIDEO ENGINE V1→V_END ON :3009");
});
