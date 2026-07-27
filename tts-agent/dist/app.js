"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./config/logger"));
const merge_controller_1 = require("./controllers/merge.controller");
const mergeController = new merge_controller_1.MergeController();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Log every request
app.use((req, res, next) => {
    logger_1.default.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});
// API Routes
app.use('/api/v1/tts', routes_1.default);
app.post('/api/v1/merge', (req, res) => mergeController.mergeVideoAudio(req, res));
// Static files
app.use('/audio', express_1.default.static('storage/audio'));
app.use('/subtitle', express_1.default.static('storage/subtitles'));
app.use('/merged', express_1.default.static('storage/merged'));
// Health & Metrics
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
app.get('/metrics', (req, res) => {
    res.json({ status: 'metrics', memory: process.memoryUsage() });
});
// Basic Error Handler
app.use((err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
});
exports.default = app;
