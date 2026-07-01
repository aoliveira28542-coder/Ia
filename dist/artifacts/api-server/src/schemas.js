"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSchema = void 0;
const zod_1 = require("zod");
exports.jobSchema = zod_1.z.object({
    payload: zod_1.z.any()
});
