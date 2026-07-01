export async function processJob(job: any) {
  if (job.type === "video") return `video:${job.id}`;
  if (job.type === "image") return `image:${job.id}`;
  return { ok: true, id: job.id };
}
