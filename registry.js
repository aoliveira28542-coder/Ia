module.exports = {
  workers: new Set(),

  add(proc) {
    this.workers.add(proc);
  },

  remove(proc) {
    this.workers.delete(proc);
  },

  size() {
    return this.workers.size;
  }
};
