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
