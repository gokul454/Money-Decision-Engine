import { Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export class TransactionController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, category, search, startDate, endDate, limit } = req.query;
      const txs = await TransactionService.list(req.userId!, {
        type: type as any,
        category: category as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json({ success: true, count: txs.length, data: txs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tx = await TransactionService.create(req.userId!, req.body);
      res.status(201).json({ success: true, data: tx });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tx = await TransactionService.getById(req.userId!, id);
      if (!tx) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }
      res.json({ success: true, data: tx });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tx = await TransactionService.update(req.userId!, id, req.body);
      if (!tx) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }
      res.json({ success: true, data: tx });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await TransactionService.delete(req.userId!, id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
