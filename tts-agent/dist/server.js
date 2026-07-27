"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./config/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
// Ensure storage directories exist
const storagePaths = [
    path_1.default.join(process.cwd(), 'storage/audio'),
    path_1.default.join(process.cwd(), 'storage/subtitles'),
    path_1.default.join(process.cwd(), 'storage/temp'),
    path_1.default.join(process.cwd(), 'storage/video'),
    path_1.default.join(process.cwd(), 'storage/merged'),
];
storagePaths.forEach(p => fs_extra_1.default.ensureDirSync(p));
app_1.default.listen(PORT, () => {
    logger_1.default.info(`Jarvis TTS Agent started on port ${PORT}`);
});
