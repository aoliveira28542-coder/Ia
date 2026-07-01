const fs = require("fs");

const STATE_FILE = "state/index.json";

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { jobs: {} };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function updateJob(id, data) {
  const state = loadState();
  state.jobs[id] = {
    ...(state.jobs[id] || {}),
    ...data,
    updatedAt: Date.now()
  };
  saveState(state);
}

function getJob(id) {
  const state = loadState();
  return state.jobs[id] || null;
}

module.exports = { updateJob, getJob };
