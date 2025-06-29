import { RequestHandler, Router } from 'express';
import { authController } from '../controllers/auth.controllers';

export const authRouter = Router();

authRouter.post('/auth/register', authController.register as RequestHandler);
authRouter.post('/auth/login', authController.login as RequestHandler);
