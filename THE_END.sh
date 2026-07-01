#!/bin/bash
set -e

echo "=== AI VIDEO PLATFORM THE END ==="

mkdir -p \
api worker ai public output logs \
jobs/{queue,processing,done,error} \
storage/{storyboards,memory} \
database


npm init -y >/dev/null 2>&1 || true

npm install express cors better-sqlite3 uuid >/dev/null 2>&1


cat > database/db.js <<'JS'
const Database=require("better-sqlite3");

const db=new Database("database/main.db");

db.exec(`
CREATE TABLE IF NOT EXISTS jobs(
id TEXT PRIMARY KEY,
prompt TEXT,
status TEXT,
progress INTEGER,
video TEXT,
created TEXT
);
`);

module.exports=db;
JS



cat > ai/core.js <<'JS'
function createAIPlan(prompt){

return {
prompt,
style:"cinematic",
scenes:[
{
id:1,
text:"opening",
duration:3
},
{
id:2,
text:"main action",
duration:3
},
{
id:3,
text:"ending",
duration:3
}
]
};

}

module.exports=createAIPlan;
JS



cat > worker/worker.js <<'JS'
const fs=require("fs");
const {execSync}=require("child_process");
const plan=require("../ai/core");
const db=require("../database/db");

const sleep=m=>new Promise(r=>setTimeout(r,m));


for(const d of [
"jobs/queue",
"jobs/processing",
"jobs/done",
"jobs/error",
"output",
"storage/storyboards"
]) fs.mkdirSync(d,{recursive:true});



async function processJob(file){

let q="jobs/queue/"+file;
let p="jobs/processing/"+file;


fs.renameSync(q,p);


try{

let job=JSON.parse(fs.readFileSync(p));


let ai=plan(job.prompt);


fs.writeFileSync(
`storage/storyboards/${job.id}.json`,
JSON.stringify(ai,null,2)
);



db.prepare(
"INSERT OR REPLACE INTO jobs VALUES(?,?,?,?,?,?)"
)
.run(
job.id,
job.prompt,
"rendering",
50,
"",
job.created
);



let out=`output/${job.id}.mp4`;


execSync(
`ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=9 ${out}`,
{stdio:"ignore"}
);



job.status="done";
job.progress=100;
job.video=out;


db.prepare(
"UPDATE jobs SET status=?,progress=?,video=? WHERE id=?"
)
.run(
"done",
100,
out,
job.id
);



fs.writeFileSync(
"jobs/done/"+file,
JSON.stringify(job,null,2)
);


fs.unlinkSync(p);


console.log("FINISHED",job.id);



}catch(e){

fs.renameSync(
p,
"jobs/error/"+file
);

console.log("FAILED",file);

}

}



async function start(){

console.log("THE END WORKER ONLINE");


while(true){

let files=
fs.readdirSync("jobs/queue")
.filter(x=>x.endsWith(".json"));


for(let f of files)
await processJob(f);


await sleep(500);

}

}


start();
JS




cat > api/server.js <<'JS'
const express=require("express");
const cors=require("cors");
const fs=require("fs");
const {v4:uuid}=require("uuid");
const db=require("../database/db");


const app=express();


app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/output",express.static("output"));



app.post("/generate",(req,res)=>{


let id=uuid();


let job={
id,
prompt:req.body.prompt||"empty",
status:"queued",
progress:0,
created:new Date().toISOString()
};



fs.writeFileSync(
`jobs/queue/${id}.json`,
JSON.stringify(job,null,2)
);



res.json(job);

});



app.get("/jobs",(req,res)=>{

res.json(
db.prepare(
"SELECT * FROM jobs ORDER BY created DESC"
).all()
);

});



app.get("/health",(req,res)=>{

res.json({
system:"ONLINE",
version:"THE END",
api:true,
worker:true,
ffmpeg:true
});

});



app.listen(3008,()=>{
console.log("API ONLINE :3008");
});
JS




cat > public/index.html <<'HTML'
<!doctype html>

<html>

<body>

<h1>AI VIDEO THE END</h1>


<input id="p" placeholder="Seu prompt">


<button onclick="go()">
GERAR VIDEO
</button>


<pre id="o"></pre>


<script>

async function go(){

let r=
await fetch("/generate",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:p.value
})
});


o.textContent=
await r.text();

}

</script>

</body>

</html>
HTML




cat > jobs/queue/test.json <<'JSON'
{
"id":"first-test",
"prompt":"cinematic AI video",
"status":"queued",
"progress":0,
"created":"now"
}
JSON



echo ""
echo "================================"
echo "THE END INSTALADO"
echo "================================"
echo "API:    node api/server.js"
echo "WORKER: node worker/worker.js"

