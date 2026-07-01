"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = routes;
const memory_1 = require("../store/memory");
const crypto_1 = require("crypto");
function routes(app) {
    app.use(require("express").json());
    app.post("/jobs", (req, res) => {
        const id = (0, crypto_1.randomUUID)();
        (0, memory_1.enqueue)({
            id,
            type: req.body?.type || "generic",
            payload: req.body || {},
            status: "queued",
        });
        res.json({ jobId: id });
    });
    app.get("/jobs/:id", (req, res) => {
        res.json((0, memory_1.getJob)(req.params.id));
    });
    app.get("/health", (_, res) => {
        res.json({ ok: true });
    });
}
