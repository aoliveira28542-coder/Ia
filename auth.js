const jwt = require("jsonwebtoken");
const SECRET = "secret123";

function sign(user){
  return jwt.sign({user}, SECRET, {expiresIn:"7d"});
}

function verify(req,res,next){
  const t = req.headers.authorization;
  if(!t) return res.status(401).end("no token");
  try {
    req.user = jwt.verify(t.split(" ")[1], SECRET);
    next();
  } catch {
    res.status(401).end("invalid");
  }
}

module.exports = { sign, verify };
