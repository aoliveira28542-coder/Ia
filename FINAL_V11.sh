#!/bin/bash
set -e

mkdir -p jobs/{queue,processing,done,error} \
storage/{storyboards,scenes,memory} \
output worker

cat > worker/worker.js <<'JS'
const fs=require("fs");
const {execSync}=require("child_process");

const sleep=m=>new Promise(r=>setTimeout(r,m));

[
"jobs/queue",
"jobs/processing",
"jobs/done",
"jobs/error",
"storage/storyboards",
"storage/scenes",
"storage/memory",
"output"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));

function save(p,o){
fs.writeFileSync(p,JSON.stringify(o,null,2));
}

function createStoryboard(job){

let scenes=[
{
id:1,
prompt:job.prompt+" cinematic opening",
duration:2
},
{
id:2,
prompt:job.prompt+" main scene",
duration:2
},
{
id:3,
prompt:job.prompt+" final shot",
duration:2
}
];

save(
`storage/storyboards/${job.id}.json`,
{job:job.id,scenes}
);

return scenes;

}


function renderScene(scene,id){

let file=`output/${id}-scene-${scene.id}.mp4`;

execSync(
`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=${scene.duration} ${file}`,
{stdio:"ignore"}
);

return file;

}


async function process(file){

let src="jobs/queue/"+file;
let proc="jobs/processing/"+file;

fs.renameSync(src,proc);

try{

let job=JSON.parse(fs.readFileSync(proc));

job.status="storyboard";

let scenes=createStoryboard(job);

job.scenes=scenes.length;

for(const s of scenes){

job.status="rendering";
renderScene(s,job.id);

}

job.status="done";
job.progress=100;

job.pipeline={
storyboard:true,
sceneMemory:true,
sceneRender:true,
ffmpeg:true,
version:"V11"
};

save(
"jobs/done/"+file,
job
);

fs.unlinkSync(proc);

console.log("DONE",job.id);

}catch(e){

fs.renameSync(
proc,
"jobs/error/"+file
);

console.log("ERROR",file);

}

}


async function worker(id){

console.log("V11 WORKER",id,"ONLINE");

while(true){

let files=fs.readdirSync("jobs/queue")
.filter(x=>x.endsWith(".json"));

for(const f of files)
await process(f);

await sleep(500);

}

}


for(let i=0;i<4;i++)
worker(i);
JS


cat > jobs/queue/v11-test.json <<'JSON'
{
"id":"v11-test",
"prompt":"future AI cinematic city",
"status":"queued",
"progress":0
}
JSON


node worker/worker.js

