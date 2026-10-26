import { Router } from 'express';
import { GoalController, RecurringController, InsightController, ProfileController } from '../controllers/other.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const goalRouter = Router();
goalRouter.use(authMiddleware);
goalRouter.get('/', GoalController.list);
goalRouter.post('/', GoalController.create);
goalRouter.put('/:id', GoalController.update);
goalRouter.delete('/:id', GoalController.delete);

export const recurringRouter = Router();
recurringRouter.use(authMiddleware);
recurringRouter.get('/', RecurringController.list);
recurringRouter.post('/', RecurringController.create);
recurringRouter.put('/:id', RecurringController.update);
recurringRouter.delete('/:id', RecurringController.delete);

export const insightRouter = Router();
insightRouter.use(authMiddleware);
insightRouter.get('/', InsightController.getInsights);

export const profileRouter = Router();
profileRouter.use(authMiddleware);
profileRouter.get('/', ProfileController.getProfile);
profileRouter.put('/', ProfileController.updateProfile);
