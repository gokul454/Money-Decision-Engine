import { analyzeSpendingInsights, SpendingInsightsResult } from '../engines/insight.engine.js';
import { TransactionService } from './transaction.service.js';

export class InsightService {
  static async getInsights(userId: string): Promise<SpendingInsightsResult> {
    const transactions = await TransactionService.list(userId);

    const mapped = transactions.map((t: any) => ({
      category: t.category,
      amount: t.amount,
      type: t.type,
      timeOfDay: t.timeOfDay,
      isImpulse: t.isImpulse,
      transactionDate: new Date(t.transactionDate),
    }));

    return analyzeSpendingInsights(mapped, 7460);
  }
}
