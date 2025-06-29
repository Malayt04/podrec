import { RequestHandler, Router } from 'express';
import { recordingController } from '../controllers/recording.controller';

export const recordingRouter = Router();

recordingRouter.post('/sessions/:sessionId/chunks', recordingController.uploadChunk, recordingController.uploadChunkHandler as RequestHandler);
