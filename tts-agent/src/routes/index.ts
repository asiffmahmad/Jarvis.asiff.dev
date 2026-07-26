import { Router } from 'express';
import { generateTTS, getVoices, batchTTS, deleteAudio } from '../controllers/tts.controller';
import { validate } from '../middleware/validate';
import { generateTTSRequestSchema, batchTTSRequestSchema } from '../models/tts.schema';

const router = Router();

router.post('/generate', validate(generateTTSRequestSchema), generateTTS);
router.post('/batch', validate(batchTTSRequestSchema), batchTTS);
router.get('/voices', getVoices);
router.delete('/audio/:id', deleteAudio);

export default router;
