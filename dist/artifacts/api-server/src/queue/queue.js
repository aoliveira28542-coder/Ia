"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.queue = exports.getJob = exports.dequeue = exports.enqueue = void 0;
const memory_1 = require("../store/memory");
Object.defineProperty(exports, "queue", { enumerable: true, get: function () { return memory_1.queue; } });
Object.defineProperty(exports, "store", { enumerable: true, get: function () { return memory_1.store; } });
Object.defineProperty(exports, "enqueue", { enumerable: true, get: function () { return memory_1.enqueue; } });
Object.defineProperty(exports, "dequeue", { enumerable: true, get: function () { return memory_1.dequeue; } });
Object.defineProperty(exports, "getJob", { enumerable: true, get: function () { return memory_1.getJob; } });
