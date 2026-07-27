"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudio = exports.getVoices = exports.batchTTS = exports.generateTTS = void 0;
const tts_service_1 = require("../services/tts.service");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../config/logger"));
const ttsService = new tts_service_1.TTSService();
const generateTTS = async (req, res) => {
    try {
        const { text, voice, speed, pitch, volume } = req.body;
        const result = await ttsService.generateAudio(text, { voice, speed, pitch, volume });
        res.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        logger_1.default.error('Failed to generate TTS', error);
        res.status(500).json({ success: false, error: 'Failed to generate audio' });
    }
};
exports.generateTTS = generateTTS;
const batchTTS = async (req, res) => {
    try {
        const texts = req.body;
        const results = [];
        for (const text of texts) {
            const result = await ttsService.generateAudio(text, { voice: 'en-US-AriaNeural' });
            results.push(result);
        }
        res.json({
            success: true,
            results
        });
    }
    catch (error) {
        logger_1.default.error('Failed to process batch TTS', error);
        res.status(500).json({ success: false, error: 'Failed to process batch' });
    }
};
exports.batchTTS = batchTTS;
const getVoices = async (req, res) => {
    try {
        const voices = await ttsService.getVoices();
        res.json(voices);
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve voices' });
    }
};
exports.getVoices = getVoices;
const deleteAudio = async (req, res) => {
    try {
        const { id } = req.params;
        const audioPath = path_1.default.join(process.cwd(), 'storage/audio', `${id}.m4a`);
        const subtitlePath = path_1.default.join(process.cwd(), 'storage/subtitles', `${id}.srt`);
        await fs_extra_1.default.remove(audioPath);
        await fs_extra_1.default.remove(subtitlePath);
        res.json({ success: true, message: 'Deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
};
exports.deleteAudio = deleteAudio;
