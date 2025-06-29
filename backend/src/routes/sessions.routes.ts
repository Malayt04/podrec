import { RequestHandler, Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middlewares/auth.middleware'

export const sessionRouter = Router();

// This endpoint is now protected. A valid JWT is required.
sessionRouter.post('/sessions', authMiddleware as RequestHandler, sessionController.createSessionHandler as RequestHandler);

// Public routes (anyone can get session details or join if they have the link)
sessionRouter.get('/sessions/:id', sessionController.getSessionHandler as RequestHandler)
sessionRouter.post('/sessions/:id/join', sessionController.joinSessionHandler as RequestHandler);

// Protected routes (only the host should update or end the session)
sessionRouter.put('/sessions/:id', authMiddleware as RequestHandler, sessionController.updateSessionHandler);
sessionRouter.delete('/sessions/:id', authMiddleware as RequestHandler, sessionController.endSessionHandler as RequestHandler);
