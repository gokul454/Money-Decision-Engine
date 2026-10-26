import { Response } from 'express';
import { MoneyService } from '../services/money.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class MoneyController {
  static async getOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await MoneyService.getOverview(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSafeToSpend(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await MoneyService.getSafeToSpend(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHealthScore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await MoneyService.getHealthScore(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRunway(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await MoneyService.getRunway(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getForecast(req: AuthRequest, res: Response): Promise<void> {
    try {
      const horizon = req.query.horizon as string;
      const data = await MoneyService.getForecast(req.userId!, horizon);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export class AffordabilityController {
  static async check(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { itemName, itemPrice, category } = req.body;
      if (!itemName || itemPrice === undefined) {
        res.status(400).json({ success: false, message: 'itemName and itemPrice are required.' });
        return;
      }
      const evaluation = await MoneyService.checkAffordability(
        req.userId!,
        itemName,
        Number(itemPrice),
        category
      );
      res.json({ success: true, data: evaluation });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
