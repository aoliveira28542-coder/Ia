"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const jobs_service_js_1 = require("../jobs.service.js");
const schemas_js_1 = require("../schemas.js");
const jobsRouter = (app) => {
    app.post("/api/jobs/create", (req, res) => {
        const parsed = schemas_js_1.jobSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(parsed.error.flatten());
        }
        const job = (0, jobs_service_js_1.createJob)(parsed.data.payload);
        res.json(job);
    });
    app.get("/api/jobs/:id", (req, res) => {
        const job = (0, jobs_service_js_1.fetchJob)(req.params.id);
        if (!job)
            return res.status(404).json({ error: "not found" });
        res.json(job);
    });
};
exports.jobsRouter = jobsRouter;
