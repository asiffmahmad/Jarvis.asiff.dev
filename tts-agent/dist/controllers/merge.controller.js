"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeController = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const uuid_1 = require("uuid");
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const logger_1 = __importDefault(require("../config/logger"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class MergeController {
    /**
     * POST /api/v1/merge
     * Body: { pixabayApiUrl: string, audioUrl: string }
     * Downloads the top Pixabay video, merges it with the TTS audio using ffmpeg,
     * and returns a hosted .mp4 URL.
     *
     * audioUrl can be:
     *   - a relative path  (e.g. "/audio/uuid.m4a")
     *   - a full URL       (e.g. "http://localhost:4000/audio/uuid.m4a")
     */
    async mergeVideoAudio(req, res) {
        const { pixabayApiUrl, audioUrl } = req.body;
        if (!pixabayApiUrl || !audioUrl) {
            res.status(400).json({ success: false, error: 'pixabayApiUrl and audioUrl are required' });
            return;
        }
        const id = (0, uuid_1.v4)();
        const storageDir = path_1.default.join(process.cwd(), 'storage');
        const videoDir = path_1.default.join(storageDir, 'video');
        const mergedDir = path_1.default.join(storageDir, 'merged');
        await fs_extra_1.default.ensureDir(videoDir);
        await fs_extra_1.default.ensureDir(mergedDir);
        const rawVideoPath = path_1.default.join(videoDir, `${id}_raw.mp4`);
        const mergedPath = path_1.default.join(mergedDir, `${id}.mp4`);
        // Resolve audio file path — handle both relative and absolute URLs
        let audioFilePath;
        if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
            // Full URL: download the audio file first
            const audioDownloadPath = path_1.default.join(videoDir, `${id}_audio.m4a`);
            logger_1.default.info('Downloading audio from URL', { audioUrl });
            try {
                await downloadFile(audioUrl, audioDownloadPath);
                audioFilePath = audioDownloadPath;
            }
            catch (err) {
                res.status(400).json({ success: false, error: `Failed to download audio: ${err.message}` });
                return;
            }
        }
        else {
            // Relative path: resolve against storage dir
            audioFilePath = path_1.default.resolve(storageDir, audioUrl.replace(/^\//, ''));
            if (!fs_extra_1.default.existsSync(audioFilePath)) {
                res.status(400).json({ success: false, error: `Audio file not found at: ${audioFilePath}` });
                return;
            }
        }
        try {
            // Step 1: Fetch Pixabay API to get the actual video URL
            let apiData = await fetchJson(pixabayApiUrl);
            let videoHit = apiData?.hits?.[0];
            // Fallback: if no hits, try progressively simpler queries
            if (!videoHit) {
                const fallbackQueries = ['technology', 'animation', 'business', 'nature'];
                const parsedUrl = new URL(pixabayApiUrl);
                const originalQuery = parsedUrl.searchParams.get('q') || '';
                for (const fb of fallbackQueries) {
                    parsedUrl.searchParams.set('q', fb);
                    logger_1.default.info('Pixabay returned 0 hits, trying fallback query', { fallback: fb, originalQuery });
                    apiData = await fetchJson(parsedUrl.toString());
                    videoHit = apiData?.hits?.[0];
                    if (videoHit)
                        break;
                }
            }
            if (!videoHit) {
                res.status(404).json({ success: false, error: 'No video found from Pixabay API' });
                return;
            }
            const directVideoUrl = videoHit.videos?.medium?.url
                || videoHit.videos?.small?.url
                || videoHit.videos?.large?.url;
            if (!directVideoUrl) {
                res.status(404).json({ success: false, error: 'No direct video URL found in Pixabay response' });
                return;
            }
            // Step 2: Download the Pixabay video
            logger_1.default.info('Downloading Pixabay video', { directVideoUrl });
            await downloadFile(directVideoUrl, rawVideoPath);
            // Step 3: Merge video + audio with ffmpeg
            // -stream_loop -1 loops the video if audio is longer
            // -shortest cuts at the end of the shortest stream
            const ffmpegCmd = `ffmpeg -y -stream_loop -1 -i "${rawVideoPath}" -i "${audioFilePath}" \
        -map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest "${mergedPath}"`;
            logger_1.default.info('Running ffmpeg merge');
            const { stderr } = await execAsync(ffmpegCmd);
            if (stderr)
                logger_1.default.warn('ffmpeg stderr', { stderr: stderr.slice(0, 500) });
            // Step 4: Clean up temp files
            await fs_extra_1.default.remove(rawVideoPath).catch(() => { });
            if (audioFilePath.startsWith(videoDir)) {
                await fs_extra_1.default.remove(audioFilePath).catch(() => { });
            }
            const videoUrl = `/merged/${id}.mp4`;
            logger_1.default.info('Merge complete', { videoUrl });
            res.json({ success: true, videoUrl });
        }
        catch (err) {
            logger_1.default.error('Merge failed', { message: err.message, stderr: err.stderr });
            await fs_extra_1.default.remove(rawVideoPath).catch(() => { });
            if (audioFilePath?.startsWith(videoDir)) {
                await fs_extra_1.default.remove(audioFilePath).catch(() => { });
            }
            res.status(500).json({ success: false, error: err.stderr || err.message || 'Merge failed' });
        }
    }
}
exports.MergeController = MergeController;
// Helpers
function fetchJson(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https_1.default : http_1.default;
        const req = client.get(url, { timeout: timeoutMs }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`API returned HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                }
                catch (e) {
                    reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
                }
            });
            res.on('error', reject);
        });
        req.on('timeout', () => {
            req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
        });
        req.on('error', reject);
    });
}
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https_1.default : http_1.default;
        const file = fs_extra_1.default.createWriteStream(dest);
        client.get(url, { timeout: 30000 }, res => {
            if (res.statusCode && res.statusCode >= 400) {
                fs_extra_1.default.remove(dest).catch(() => { });
                reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve()));
        }).on('error', err => {
            fs_extra_1.default.remove(dest).catch(() => { });
            reject(err);
        });
    });
}
