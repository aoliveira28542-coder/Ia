
import { addJob, getJob } from './queue.js';

export const createJob = (payload: any) => {
  const job = {
    id: crypto.randomUUID(),
    status: "pending",
    payload,
    createdAt: Date.now()
  };

  addJob(job);
  return job;
};

export const fetchJob = (id: string) => getJob(id);
