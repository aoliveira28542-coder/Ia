import { enqueue, getJob } from "../store/memory";
import { randomUUID } from "crypto";

export function routes(app: any) {
  app.use(require("express").json());

  app.post("/jobs", (req: any, res: any) => {
    const id = randomUUID();

    enqueue({
      id,
      type: req.body?.type || "generic",
      payload: req.body || {},
      status: "queued",
    });

    res.json({ jobId: id });
  });

  app.get("/jobs/:id", (req: any, res: any) => {
    res.json(getJob(req.params.id));
  });

  app.get("/health", (_, res) => {
    res.json({ ok: true });
  });
}
