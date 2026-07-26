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
   * Body: { pixabayApiUrl: string, audioPath: string }
   * Downloads the top Pixabay video, merges it with the TTS audio using ffmpeg,
   * and returns a hosted .mp4 URL.
   */
  async mergeVideoAudio(req: Request, res: Response): Promise<void> {
    const { pixabayApiUrl, audioUrl } = req.body;

    if (!pixabayApiUrl || !audioUrl) {
      res.status(400).json({ success: false, error: 'pixabayApiUrl and audioUrl are required' });
      return;
    }

    const id = uuidv4();
    const videoDir = path.join(process.cwd(), 'storage/video');
    const mergedDir = path.join(process.cwd(), 'storage/merged');
    await fs.ensureDir(videoDir);
    await fs.ensureDir(mergedDir);

    const rawVideoPath = path.join(videoDir, `${id}_raw.mp4`);
    const audioFilePath = path.join(process.cwd(), 'storage', audioUrl.replace(/^\//, ''));
    const mergedPath = path.join(mergedDir, `${id}.mp4`);

    try {
      // Step 1: Fetch Pixabay API to get the actual video URL
      logger.info('Fetching Pixabay API', { pixabayApiUrl });
      const apiData = await fetchJson(pixabayApiUrl);
      const videoHit = apiData?.hits?.[0];

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
      // -loop 1 loops the video if audio is longer
      // -shortest cuts at the end of the shortest stream
      const ffmpegCmd = `ffmpeg -y -stream_loop -1 -i "${rawVideoPath}" -i "${audioFilePath}" \
        -map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest "${mergedPath}"`;

      logger.info('Running ffmpeg merge');
      await execAsync(ffmpegCmd);

      // Step 4: Clean up raw video
      await fs.remove(rawVideoPath);

      const videoUrl = `/merged/${id}.mp4`;
      logger.info('Merge complete', { videoUrl });
      res.json({ success: true, videoUrl });

    } catch (err: any) {
      logger.error('Merge failed', { message: err.message, stderr: err.stderr });
      // Clean up temp files
      await fs.remove(rawVideoPath).catch(() => {});
      res.status(500).json({ success: false, error: err.stderr || err.message || 'Merge failed' });
    }
  }
}

// Helpers
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, res => {
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', err => {
      fs.remove(dest).catch(() => {});
      reject(err);
    });
  });
}
