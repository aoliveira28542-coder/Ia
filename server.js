const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
  res.send("SAAS ONLINE OK");
});

app.get("/status",(req,res)=>{
  res.json({ok:true,time:Date.now()});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("RUNNING ON",PORT));
