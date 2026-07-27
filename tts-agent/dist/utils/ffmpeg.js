"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAudio = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const convertAudio = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
    });
};
exports.convertAudio = convertAudio;
