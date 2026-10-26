import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import moneyRoutes from './routes/money.routes.js';
import affordabilityRoutes from './routes/affordability.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { goalRouter, recurringRouter, insightRouter, profileRouter } from './routes/other.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { seedDemoData } from './seed/demoData.js';

export const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Health & Demo reset
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Money OS API',
    time: new Date().toISOString(),
    engine: 'active',
  });
});

app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDemoData();
    res.json({ success: true, message: 'Demo data reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/money', moneyRoutes);
app.use('/api/affordability', affordabilityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/insights', insightRouter);
app.use('/api/profile', profileRouter);

// Error handling
app.use(errorHandler);
