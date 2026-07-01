#!/bin/bash
set -e

mkdir -p api public jobs/{queue,processing,done,error} output

npm init -y >/dev/null 2>&1 || true
npm install express cors >/dev/null 2>&1

cat > api/server.js <<'JS'
const express=require("express");
const cors=require("cors");
const fs=require("fs");

const app=express();

app.use(cors());
app.use(express.json());
app.use("/output",express.static("output"));
app.use(express.static("public"));

for(const d of [
"jobs/queue",
"jobs/done",
"jobs/error"
]) fs.mkdirSync(d,{recursive:true});


app.post("/job",(req,res)=>{

let id="job-"+Date.now();

let job={
id,
prompt:req.body.prompt||"test",
status:"queued",
progress:0,
created:new Date()
};

fs.writeFileSync(
`jobs/queue/${id}.json`,
JSON.stringify(job,null,2)
);

res.json(job);

});


app.get("/jobs",(req,res)=>{

let done=fs.readdirSync("jobs/done")
.map(f=>JSON.parse(fs.readFileSync("jobs/done/"+f)));

res.json(done);

});


app.get("/health",(req,res)=>{
res.json({
status:"online",
version:"V12"
});
});


app.listen(3008,()=>{
console.log("API V12 ONLINE :3008");
});
JS


cat > public/index.html <<'HTML'
<!doctype html>
<html>
<body>

<h1>AI VIDEO V12</h1>

<input id="p" placeholder="prompt">
<button onclick="go()">GERAR</button>

<pre id="out"></pre>

<script>

async function go(){

let r=await fetch("/job",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:p.value
})
});

out.textContent=await r.text();

}

</script>

</body>
</html>
HTML


cat > jobs/queue/v12-test.json <<'JSON'
{
"id":"v12-test",
"prompt":"api pipeline test",
"status":"queued",
"progress":0
}
JSON


node api/server.js
