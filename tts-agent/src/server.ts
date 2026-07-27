import app from './app';
import logger from './config/logger';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Ensure storage directories exist
const storagePaths = [
  path.join(process.cwd(), 'storage/audio'),
  path.join(process.cwd(), 'storage/subtitles'),
  path.join(process.cwd(), 'storage/temp'),
  path.join(process.cwd(), 'storage/video'),
  path.join(process.cwd(), 'storage/merged'),
];

storagePaths.forEach(p => fs.ensureDirSync(p));

app.listen(PORT, () => {
  logger.info(`Jarvis TTS Agent started on port ${PORT}`);
});
