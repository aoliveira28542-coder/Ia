#!/bin/bash
set -e

mkdir -p api public database jobs/{queue,processing,done,error} output

npm install express cors better-sqlite3 uuid >/dev/null 2>&1

cat > database/db.js <<'JS'
const Database=require("better-sqlite3");

const db=new Database("database/app.db");

db.exec(`
CREATE TABLE IF NOT EXISTS jobs(
id TEXT PRIMARY KEY,
prompt TEXT,
status TEXT,
progress INTEGER,
created TEXT,
finished TEXT
);
`);

module.exports=db;
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


function saveJob(job){

db.prepare(`
INSERT OR REPLACE INTO jobs
(id,prompt,status,progress,created,finished)
VALUES (?,?,?,?,?,?)
`).run(
job.id,
job.prompt,
job.status,
job.progress,
job.created,
job.finished||null
);

}


app.post("/job",(req,res)=>{

let job={
id:uuid(),
prompt:req.body.prompt||"empty",
status:"queued",
progress:0,
created:new Date().toISOString()
};


fs.writeFileSync(
`jobs/queue/${job.id}.json`,
JSON.stringify(job,null,2)
);


saveJob(job);

res.json(job);

});


app.get("/jobs",(req,res)=>{

let jobs=db.prepare(
"SELECT * FROM jobs ORDER BY created DESC"
).all();

res.json(jobs);

});


app.get("/health",(req,res)=>{

res.json({
version:"V13",
database:true,
queue:true
});

});


app.listen(3008,()=>{
console.log("V13 ONLINE :3008");
});
JS


cat > public/index.html <<'HTML'
<!doctype html>
<html>
<body>

<h2>AI VIDEO V13</h2>

<input id="prompt" placeholder="Digite prompt">

<button onclick="createJob()">
GERAR
</button>

<pre id="result"></pre>

<script>

async function createJob(){

let r=await fetch("/job",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:prompt.value
})
});

result.textContent=
await r.text();

}

</script>

</body>
</html>
HTML


node api/server.js
