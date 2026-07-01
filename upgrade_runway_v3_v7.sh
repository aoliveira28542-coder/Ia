#!/bin/bash
set -e

echo "🚀 RUNWAY V3→V7 UPGRADE"

BASE="$HOME/workspace"

mkdir -p \
$BASE/security \
$BASE/worker \
$BASE/render \
$BASE/ai \
$BASE/logs \
$BASE/jobs/{queue,processing,done,error}

################################
# V3 SANDBOX ENGINE
################################

cat > $BASE/security/sandbox.js <<'JS'
const {execFile}=require("child_process");

function sandbox(cmd,args=[]){
 return new Promise((resolve,reject)=>{
  execFile(cmd,args,{
   timeout:300000,
   env:{PATH:process.env.PATH}
  },(e,out,err)=>{
   if(e) reject(e);
   else resolve(out);
  });
 });
}

module.exports={sandbox};
JS


################################
# V4 SAFE WORKER
################################

cat > $BASE/worker/worker.js <<'JS'
const fs=require("fs");
const path=require("path");

const Q="./jobs/queue";
const DONE="./jobs/done";

async function sleep(n){
 return new Promise(r=>setTimeout(r,n));
}

async function run(){

console.log("⚙️ WORKER V4 ONLINE");

while(true){

let files=fs.readdirSync(Q);

for(const f of files){

let job=JSON.parse(
fs.readFileSync(path.join(Q,f))
);

console.log("PROCESSING",job.id);

job.status="processing";

job.result={
 engine:"safe-worker",
 stage:"ready"
};

job.status="done";

fs.writeFileSync(
path.join(DONE,f),
JSON.stringify(job,null,2)
);

}

await sleep(1000);

}

}

run();
JS


################################
# V5 VIDEO ENGINE
################################

cat > $BASE/render/video-engine.js <<'JS'

const {exec}=require("child_process");

function render(frames,out){

return new Promise((resolve,reject)=>{

exec(
`ffmpeg -y -framerate 24 -i ${frames}/%04d.png ${out}`,
(e)=>{

if(e) reject(e);
else resolve(out);

});

});

}

module.exports={render};

JS


################################
# V6 AI SCENE ENGINE
################################

cat > $BASE/ai/scene-engine.js <<'JS'

function createScenes(prompt){

return [
{
scene:1,
prompt:`${prompt}, cinematic wide shot`,
camera:"dolly",
duration:4
},
{
scene:2,
prompt:`${prompt}, close shot`,
camera:"tracking",
duration:4
}
];

}

module.exports={createScenes};

JS


################################
# V7 PROD CONFIG
################################

cat > $BASE/.env.production <<'EOF'
NODE_ENV=production
QUEUE_ENABLED=true
GPU_READY=true
VIDEO_ENGINE=true
AI_ENGINE=true
