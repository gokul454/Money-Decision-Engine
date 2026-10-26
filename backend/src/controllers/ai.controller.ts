import { Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class AIController {
  static async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message is required.' });
        return;
      }

      const result = await AIService.handleUserMessage(req.userId!, message);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
