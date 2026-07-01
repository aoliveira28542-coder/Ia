
export type Job = {
  id: string;
  status: "pending" | "processing" | "done" | "failed";
  payload: any;
  result?: any;
  error?: any;
  createdAt: number;
};

export const queue: Job[] = [];

export const addJob = (job: Job) => queue.push(job);

export const getNextJob = () => {
  const job = queue.find(j => j.status === "pending");
  if (!job) return null;
  job.status = "processing";
  return job;
};

export const getJob = (id: string) => queue.find(j => j.id === id);
