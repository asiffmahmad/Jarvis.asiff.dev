import { Request, Response } from 'express';
import { TTSService } from '../services/tts.service';
import fs from 'fs-extra';
import path from 'path';
import logger from '../config/logger';

const ttsService = new TTSService();

export const generateTTS = async (req: Request, res: Response) => {
  try {
    const { text, voice, speed, pitch, volume } = req.body;
    
    const result = await ttsService.generateAudio(text, { voice, speed, pitch, volume });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('Failed to generate TTS', error);
    res.status(500).json({ success: false, error: 'Failed to generate audio' });
  }
};

export const batchTTS = async (req: Request, res: Response) => {
  try {
    const texts: string[] = req.body;
    const results = [];
    
    for (const text of texts) {
      const result = await ttsService.generateAudio(text, { voice: 'en-US-AriaNeural' });
      results.push(result);
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error: any) {
    logger.error('Failed to process batch TTS', error);
    res.status(500).json({ success: false, error: 'Failed to process batch' });
  }
};

export const getVoices = async (req: Request, res: Response) => {
  try {
    const voices = await ttsService.getVoices();
    res.json(voices);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve voices' });
  }
};

export const deleteAudio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const audioPath = path.join(process.cwd(), 'storage/audio', `${id}.m4a`);
    const subtitlePath = path.join(process.cwd(), 'storage/subtitles', `${id}.srt`);
    
    await fs.remove(audioPath);
    await fs.remove(subtitlePath);
    
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
};
