"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchTTSRequestSchema = exports.generateTTSRequestSchema = void 0;
const zod_1 = require("zod");
exports.generateTTSRequestSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(5000),
    voice: zod_1.z.string().optional().default('en-US-AriaNeural'),
    speed: zod_1.z.number().min(-100).max(200).optional().default(1.0),
    pitch: zod_1.z.number().min(-100).max(100).optional().default(0),
    volume: zod_1.z.number().min(0).max(100).optional().default(100),
});
exports.batchTTSRequestSchema = zod_1.z.array(zod_1.z.string().min(1).max(5000)).min(1).max(50);
