
import { createJob, fetchJob } from "../jobs.service.js";
import { jobSchema } from "../schemas.js";

export const jobsRouter = (app) => {

  app.post("/api/jobs/create", (req, res) => {
    const parsed = jobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const job = createJob(parsed.data.payload);
    res.json(job);
  });

  app.get("/api/jobs/:id", (req, res) => {
    const job = fetchJob(req.params.id);
    if (!job) return res.status(404).json({ error: "not found" });

    res.json(job);
  });
};
