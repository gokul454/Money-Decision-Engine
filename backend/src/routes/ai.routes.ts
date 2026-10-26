import { Router } from 'express';
import { z } from 'zod';
import { AIController } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();
router.use(authMiddleware);

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

router.post('/chat', validateBody(chatSchema), AIController.chat);

export default router;
