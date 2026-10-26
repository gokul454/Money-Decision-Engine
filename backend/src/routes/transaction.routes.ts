import { Router } from 'express';
import { z } from 'zod';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']).default('expense'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional(),
  paymentMethod: z.enum(['UPI', 'Card', 'Cash', 'NetBanking']).default('UPI'),
  transactionDate: z.string().optional(),
  notes: z.string().optional(),
  isImpulse: z.boolean().optional(),
  timeOfDay: z.string().optional(),
});

router.use(authMiddleware);

router.get('/', TransactionController.list);
router.post('/', validateBody(transactionSchema), TransactionController.create);
router.get('/:id', TransactionController.getById);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

export default router;
