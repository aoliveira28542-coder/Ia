export type Job = {
  id: string;
  type: string;
  payload: any;
  status: "queued" | "running" | "done" | "failed";
  result?: any;
};

export const queue: Job[] = [];
export const store = new Map<string, Job>();

export const enqueue = (job: Job) => {
  queue.push(job);
  store.set(job.id, job);
};

export const dequeue = () => queue.shift();
export const getJob = (id: string) => store.get(id);
