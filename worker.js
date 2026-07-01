const db = require("./db");

function loop(){
  db.get("SELECT * FROM jobs WHERE status='queued' LIMIT 1", (err,row)=>{
    if(row){
      db.run("UPDATE jobs SET status='done' WHERE id=?",[row.id]);
      console.log("processed", row.id);
    }
  });

  setTimeout(loop, 500);
}

console.log("WORKER ONLINE");
loop();
