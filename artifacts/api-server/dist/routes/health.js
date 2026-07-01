"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const src_1 = require("../../api-zod/src");
const router = (0, express_1.Router)();
router.get("/healthz", (_req, res) => {
    const data = src_1.HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
});
exports.default = router;
