const express = require("express");
const app = express();

app.use(express.json());

app.get("/metrics",(req,res)=>{
  res.json({ok:true,version:"V55-STABLE"});
});

app.post("/generate",(req,res)=>{
  res.json({ok:true,prompt:req.body?.prompt});
});

app.listen(3000,()=>console.log("V55 RUNNING"));
