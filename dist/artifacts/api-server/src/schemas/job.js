"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSchema = void 0;
const zod_1 = require("zod");
exports.JobSchema = zod_1.z.object({
    type: zod_1.z.string().default("generic"),
    payload: zod_1.z.any().default({}),
});
