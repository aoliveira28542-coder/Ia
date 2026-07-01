const express = require("express");
const app = express();

/* HEALTH CHECK (Render usa isso pra validar boot) */
app.get("/", (req, res) => {
  res.send("OK - SERVER ONLINE");
});

/* STATUS REAL */
app.get("/status", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    time: Date.now()
  });
});

/* RENDER PORT FIX (OBRIGATÓRIO) */
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON PORT", PORT);
});
