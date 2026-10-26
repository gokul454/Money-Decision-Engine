import { Router } from 'express';
import { z } from 'zod';
import { AffordabilityController } from '../controllers/money.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();
router.use(authMiddleware);

const affordabilitySchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  itemPrice: z.number().positive('Price must be greater than 0'),
  category: z.string().optional(),
});

router.post('/check', validateBody(affordabilitySchema), AffordabilityController.check);

export default router;
