"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../config/logger"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Map Edge TTS voice names → macOS say voices
const VOICE_MAP = {
    'en-US-AriaNeural': 'Samantha',
    'en-US-GuyNeural': 'Alex',
    'en-US-JennyNeural': 'Samantha',
    'en-IN-NeerjaNeural': 'Veena',
};
class TTSService {
    async getVoices() {
        return [
            { name: 'en-US-AriaNeural', locale: 'en-US', gender: 'Female', macVoice: 'Samantha' },
            { name: 'en-US-GuyNeural', locale: 'en-US', gender: 'Male', macVoice: 'Alex' },
            { name: 'en-US-JennyNeural', locale: 'en-US', gender: 'Female', macVoice: 'Samantha' },
            { name: 'en-IN-NeerjaNeural', locale: 'en-IN', gender: 'Female', macVoice: 'Veena' },
        ];
    }
    async generateAudio(text, options) {
        const id = (0, uuid_1.v4)();
        const aiffPath = path_1.default.join(process.cwd(), 'storage/temp', `${id}.aiff`);
        const audioPath = path_1.default.join(process.cwd(), 'storage/audio', `${id}.m4a`);
        const subtitlePath = path_1.default.join(process.cwd(), 'storage/subtitles', `${id}.srt`);
        const edgeVoice = options.voice || 'en-US-AriaNeural';
        const macVoice = VOICE_MAP[edgeVoice] || 'Samantha';
        // Escape single quotes for shell safety
        const escapedText = text.replace(/'/g, "'\\''");
        try {
            // Step 1: Generate AIFF using macOS say
            await execAsync(`say -v "${macVoice}" -o "${aiffPath}" '${escapedText}'`);
            // Step 2: Convert AIFF → M4A (AAC) using macOS built-in afconvert
            await execAsync(`afconvert -f m4af -d aac "${aiffPath}" "${audioPath}"`);
            await fs_extra_1.default.remove(aiffPath);
            // Write SRT subtitle
            const wordCount = text.split(' ').length;
            const duration = wordCount * 0.4;
            const mm = String(Math.floor(duration / 60)).padStart(2, '0');
            const ss = String(Math.ceil(duration % 60)).padStart(2, '0');
            await fs_extra_1.default.writeFile(subtitlePath, `1\n00:00:00,000 --> 00:${mm}:${ss},000\n${text}\n`);
            return {
                audioUrl: `/audio/${id}.m4a`,
                subtitleUrl: `/subtitle/${id}.srt`,
                duration,
                voice: edgeVoice,
            };
        }
        catch (err) {
            logger_1.default.error('TTS Generation error', { message: err.message, stderr: err.stderr });
            if (fs_extra_1.default.existsSync(aiffPath)) {
                await fs_extra_1.default.remove(aiffPath).catch(() => { });
            }
            throw new Error(err.stderr || err.message || 'TTS generation failed');
        }
    }
}
exports.TTSService = TTSService;
