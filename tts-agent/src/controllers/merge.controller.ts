import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';
import logger from '../config/logger';

const execAsync = promisify(exec);

export class MergeController {
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
  async mergeVideoAudio(req: Request, res: Response): Promise<void> {
    const { pixabayApiUrl, audioUrl } = req.body;

    if (!pixabayApiUrl || !audioUrl) {
      res.status(400).json({ success: false, error: 'pixabayApiUrl and audioUrl are required' });
      return;
    }

    const id = uuidv4();
    const storageDir = path.join(process.cwd(), 'storage');
    const videoDir = path.join(storageDir, 'video');
    const mergedDir = path.join(storageDir, 'merged');
    await fs.ensureDir(videoDir);
    await fs.ensureDir(mergedDir);

    const rawVideoPath = path.join(videoDir, `${id}_raw.mp4`);
    const mergedPath = path.join(mergedDir, `${id}.mp4`);

    // Resolve audio file path — handle both relative and absolute URLs
    let audioFilePath: string;
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      // Full URL: download the audio file first
      const audioDownloadPath = path.join(videoDir, `${id}_audio.m4a`);
      logger.info('Downloading audio from URL', { audioUrl });
      try {
        await downloadFile(audioUrl, audioDownloadPath);
        audioFilePath = audioDownloadPath;
      } catch (err: any) {
        res.status(400).json({ success: false, error: `Failed to download audio: ${err.message}` });
        return;
      }
    } else {
      // Relative path: resolve against storage dir
      audioFilePath = path.resolve(storageDir, audioUrl.replace(/^\//, ''));
      if (!fs.existsSync(audioFilePath)) {
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
          logger.info('Pixabay returned 0 hits, trying fallback query', { fallback: fb, originalQuery });
          apiData = await fetchJson(parsedUrl.toString());
          videoHit = apiData?.hits?.[0];
          if (videoHit) break;
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
      logger.info('Downloading Pixabay video', { directVideoUrl });
      await downloadFile(directVideoUrl, rawVideoPath);

      // Step 3: Merge video + audio with ffmpeg
      // -stream_loop -1 loops the video if audio is longer
      // -shortest cuts at the end of the shortest stream
      const ffmpegCmd = `ffmpeg -y -stream_loop -1 -i "${rawVideoPath}" -i "${audioFilePath}" \
        -map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest "${mergedPath}"`;

      logger.info('Running ffmpeg merge');
      const { stderr } = await execAsync(ffmpegCmd);
      if (stderr) logger.warn('ffmpeg stderr', { stderr: stderr.slice(0, 500) });

      // Step 4: Clean up temp files
      await fs.remove(rawVideoPath).catch(() => {});
      if (audioFilePath.startsWith(videoDir)) {
        await fs.remove(audioFilePath).catch(() => {});
      }

      const videoUrl = `/merged/${id}.mp4`;
      logger.info('Merge complete', { videoUrl });
      res.json({ success: true, videoUrl });

    } catch (err: any) {
      logger.error('Merge failed', { message: err.message, stderr: err.stderr });
      await fs.remove(rawVideoPath).catch(() => {});
      if (audioFilePath?.startsWith(videoDir)) {
        await fs.remove(audioFilePath).catch(() => {});
      }
      res.status(500).json({ success: false, error: err.stderr || err.message || 'Merge failed' });
    }
  }
}

// Helpers
function fetchJson(url: string, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: timeoutMs }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`API returned HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
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

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, { timeout: 30000 }, res => {
      if (res.statusCode && res.statusCode >= 400) {
        fs.remove(dest).catch(() => {});
        reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', err => {
      fs.remove(dest).catch(() => {});
      reject(err);
    });
  });
}
