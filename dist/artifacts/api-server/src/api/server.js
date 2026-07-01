"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAPI = startAPI;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
function startAPI() {
    const app = (0, express_1.default)();
    (0, routes_1.routes)(app);
    app.listen(3000, () => {
        console.log("API running on 3000");
    });
}
