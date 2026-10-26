import { Router } from 'express';
import { MoneyController } from '../controllers/money.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/overview', MoneyController.getOverview);
router.get('/safe-to-spend', MoneyController.getSafeToSpend);
router.get('/health', MoneyController.getHealthScore);
router.get('/runway', MoneyController.getRunway);
router.get('/forecast', MoneyController.getForecast);

export default router;
