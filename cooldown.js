let restarting = false;

function canRestart() {
  if (restarting) return false;

  restarting = true;

  setTimeout(() => {
    restarting = false;
  }, 5000); // cooldown global

  return true;
}

module.exports = { canRestart };
