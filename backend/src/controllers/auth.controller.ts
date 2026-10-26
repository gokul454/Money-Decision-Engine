import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, currency } = req.body;
      const result = await AuthService.register({ name, email, password, currency });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  static async me(req: any, res: Response): Promise<void> {
    try {
      const user = await AuthService.findById(req.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({
        success: true,
        data: {
          id: user._id?.toString() || user.id,
          name: user.name,
          email: user.email,
          currency: user.currency || 'INR',
          levelTitle: user.levelTitle || 'Level 2 Money Smart',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
