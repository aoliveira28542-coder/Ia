function safeRequire(name){
  try {
    return require(name);
  } catch (e) {
    console.log("AUTO-INSTALL:", name);
    require("child_process").execSync("npm install " + name, {stdio:"inherit"});
    return require(name);
  }
}

module.exports = safeRequire;
