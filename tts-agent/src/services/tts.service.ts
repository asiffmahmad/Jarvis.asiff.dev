import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Map Edge TTS voice names → macOS say voices
const VOICE_MAP: Record<string, string> = {
  'en-US-AriaNeural':   'Samantha',
  'en-US-GuyNeural':    'Alex',
  'en-US-JennyNeural':  'Samantha',
  'en-IN-NeerjaNeural': 'Veena',
};

export class TTSService {
  async getVoices() {
    return [
      { name: 'en-US-AriaNeural',   locale: 'en-US', gender: 'Female', macVoice: 'Samantha' },
      { name: 'en-US-GuyNeural',    locale: 'en-US', gender: 'Male',   macVoice: 'Alex'     },
      { name: 'en-US-JennyNeural',  locale: 'en-US', gender: 'Female', macVoice: 'Samantha' },
      { name: 'en-IN-NeerjaNeural', locale: 'en-IN', gender: 'Female', macVoice: 'Veena'    },
    ];
  }

  async generateAudio(
    text: string,
    options: any
  ): Promise<{ audioUrl: string; subtitleUrl: string; duration: number; voice: string }> {
    const id = uuidv4();
    const aiffPath     = path.join(process.cwd(), 'storage/temp',      `${id}.aiff`);
    const audioPath    = path.join(process.cwd(), 'storage/audio',     `${id}.m4a`);
    const subtitlePath = path.join(process.cwd(), 'storage/subtitles', `${id}.srt`);

    const edgeVoice = options.voice || 'en-US-AriaNeural';
    const macVoice  = VOICE_MAP[edgeVoice] || 'Samantha';

    // Escape single quotes for shell safety
    const escapedText = text.replace(/'/g, "'\\''");

    try {
      // Step 1: Generate AIFF using macOS say
      await execAsync(`say -v "${macVoice}" -o "${aiffPath}" '${escapedText}'`);

      // Step 2: Convert AIFF → M4A (AAC) using macOS built-in afconvert
      await execAsync(`afconvert -f m4af -d aac "${aiffPath}" "${audioPath}"`);
      await fs.remove(aiffPath);

      // Write SRT subtitle
      const wordCount = text.split(' ').length;
      const duration  = wordCount * 0.4;
      const mm = String(Math.floor(duration / 60)).padStart(2, '0');
      const ss = String(Math.ceil(duration % 60)).padStart(2, '0');
      await fs.writeFile(subtitlePath, `1\n00:00:00,000 --> 00:${mm}:${ss},000\n${text}\n`);

      return {
        audioUrl:    `/audio/${id}.m4a`,
        subtitleUrl: `/subtitle/${id}.srt`,
        duration,
        voice: edgeVoice,
      };
    } catch (err: any) {
      logger.error('TTS Generation error', { message: err.message, stderr: err.stderr });
      if (fs.existsSync(aiffPath)) {
        await fs.remove(aiffPath).catch(() => {});
      }
      throw new Error(err.stderr || err.message || 'TTS generation failed');
    }
  }
}

