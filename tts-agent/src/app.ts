import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import logger from './config/logger';
import { MergeController } from './controllers/merge.controller';

const mergeController = new MergeController();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(compression());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/v1/tts', routes);
app.post('/api/v1/merge', (req, res) => mergeController.mergeVideoAudio(req, res));

// Static files
app.use('/audio', express.static('storage/audio'));
app.use('/subtitle', express.static('storage/subtitles'));
app.use('/merged', express.static('storage/merged'));

// Health & Metrics
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
app.get('/metrics', (req, res) => {
  res.json({ status: 'metrics', memory: process.memoryUsage() });
});

// Basic Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, error: err.message });
});

export default app;
