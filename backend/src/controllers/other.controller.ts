import { Response } from 'express';
import { GoalService } from '../services/goal.service.js';
import { RecurringService } from '../services/recurring.service.js';
import { InsightService } from '../services/insight.service.js';
import { ProfileService } from '../services/profile.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class GoalController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as any;
      const goals = await GoalService.list(req.userId!, status);
      res.json({ success: true, count: goals.length, data: goals });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const goal = await GoalService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const goal = await GoalService.update(req.userId!, id, req.body);
      if (!goal) {
        res.status(404).json({ success: false, message: 'Goal not found' });
        return;
      }
      res.json({ success: true, data: goal });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await GoalService.delete(req.userId!, id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Goal not found' });
        return;
      }
      res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export class RecurringController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const recurring = await RecurringService.list(req.userId!);
      res.json({ success: true, count: recurring.length, data: recurring });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rec = await RecurringService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: rec });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const rec = await RecurringService.update(req.userId!, id, req.body);
      if (!rec) {
        res.status(404).json({ success: false, message: 'Recurring expense not found' });
        return;
      }
      res.json({ success: true, data: rec });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await RecurringService.delete(req.userId!, id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Recurring expense not found' });
        return;
      }
      res.json({ success: true, message: 'Recurring expense deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export class InsightController {
  static async getInsights(req: AuthRequest, res: Response): Promise<void> {
    try {
      const insights = await InsightService.getInsights(req.userId!);
      res.json({ success: true, data: insights });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export class ProfileController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await ProfileService.getProfile(req.userId!);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const updated = await ProfileService.updateProfile(req.userId!, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
