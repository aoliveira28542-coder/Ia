"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./lib/logger");
const app = (0, express_1.default)();
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url?.split("?")[0],
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api", routes_1.default);
// Serve uploaded assets
const uploadsDir = path_1.default.resolve(process.cwd(), "uploads");
fs_1.promises.mkdir(uploadsDir, { recursive: true }).catch(() => undefined);
app.use("/uploads", express_1.default.static(uploadsDir));
exports.default = app;
