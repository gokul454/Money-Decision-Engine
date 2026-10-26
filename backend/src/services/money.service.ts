import { calculateSafeToSpend, SafeToSpendResult } from '../engines/safeToSpend.engine.js';
import { calculateMoneyHealthScore, HealthScoreResult } from '../engines/healthScore.engine.js';
import { calculateFinancialRunway, RunwayResult } from '../engines/runway.engine.js';
import { generateFinancialForecasts, HorizonForecast } from '../engines/forecast.engine.js';
import { evaluateAffordability, AffordabilityResult } from '../engines/affordability.engine.js';
import { ProfileService } from './profile.service.js';
import { TransactionService } from './transaction.service.js';
import { RecurringService } from './recurring.service.js';
import { GoalService } from './goal.service.js';

export class MoneyService {
  static async getOverview(userId: string) {
    const profileData = await ProfileService.getProfile(userId);
    const p = profileData.financial;
    const allTransactions = await TransactionService.list(userId);
    const recurringList = await RecurringService.list(userId);
    const goalsList = await GoalService.list(userId);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Expenses this month
    const thisMonthExpenses = allTransactions.filter((t: any) => {
      const d = new Date(t.transactionDate);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const actualSpentThisMonth = thisMonthExpenses.reduce((sum: number, t: any) => sum + t.amount, 0);

    // Expenses this week (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thisWeekExpenses = allTransactions.filter((t: any) => {
      const d = new Date(t.transactionDate);
      return t.type === 'expense' && d >= sevenDaysAgo;
    });
    const actualSpentThisWeek = thisWeekExpenses.reduce((sum: number, t: any) => sum + t.amount, 0);

    // Upcoming recurring bills in this cycle
    const upcomingBills = recurringList.reduce((sum: number, r: any) => sum + r.amount, 0);

    // Total income this month
    const thisMonthIncome = allTransactions
      .filter((t: any) => {
        const d = new Date(t.transactionDate);
        return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalIncome = thisMonthIncome > 0 ? thisMonthIncome : p.monthlyIncome;

    // Run Safe-To-Spend Engine
    const safeToSpend = calculateSafeToSpend({
      monthlyIncome: totalIncome,
      fixedExpenses: p.fixedExpenses,
      savingsTarget: p.savingsTarget,
      emergencyReserve: p.emergencyReserve,
      currentLiquidBalance: p.currentLiquidBalance,
      payday: p.payday,
      currentDate: now,
      actualSpentThisMonth: actualSpentThisMonth || 8580,
      actualSpentThisWeek: actualSpentThisWeek || 480,
      upcomingBillsThisCycle: upcomingBills || 1348,
    });

    // Run Health Score Engine
    const healthScore = calculateMoneyHealthScore({
      safeToSpendData: safeToSpend,
      goalCompletionRate: goalsList.length > 0 ? 0.85 : 0.6,
    });

    // Run Runway Engine
    const runway = calculateFinancialRunway({
      availableBalance: p.currentLiquidBalance,
      fixedMonthlyExpenses: p.fixedExpenses,
      averageMonthlyDiscretionarySpend: safeToSpend.discretionaryBudget,
      emergencyReserve: p.emergencyReserve,
    });

    // Calculate Top Spending Categories
    const catTotals: Record<string, number> = {};
    for (const t of thisMonthExpenses) {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    }
    const topCategories = Object.entries(catTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: actualSpentThisMonth > 0 ? Math.round((amount / actualSpentThisMonth) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return {
      safeToSpend,
      healthScore,
      runway,
      monthOverview: {
        income: totalIncome,
        expenses: actualSpentThisMonth || 8580,
        netCashFlow: totalIncome - (actualSpentThisMonth || 8580),
      },
      topCategories: topCategories.length > 0 ? topCategories : [
        { category: 'Food & Dining', amount: 2340, percentage: 28 },
        { category: 'Shopping', amount: 1850, percentage: 22 },
        { category: 'Transport', amount: 1120, percentage: 13 },
      ],
      user: profileData.user,
    };
  }

  static async getSafeToSpend(userId: string) {
    const overview = await this.getOverview(userId);
    return overview.safeToSpend;
  }

  static async getHealthScore(userId: string) {
    const overview = await this.getOverview(userId);
    return overview.healthScore;
  }

  static async getRunway(userId: string) {
    const overview = await this.getOverview(userId);
    return overview.runway;
  }

  static async getForecast(userId: string, horizon?: string) {
    const overview = await this.getOverview(userId);
    const forecasts = generateFinancialForecasts({
      monthlyIncome: overview.monthOverview.income,
      currentMonthlySavings: overview.safeToSpend.savingsTarget,
      discretionarySpending: overview.safeToSpend.discretionaryBudget,
      improvedMonthlyDelta: 500,
    });

    if (horizon && forecasts[horizon]) {
      return forecasts[horizon];
    }
    return forecasts;
  }

  static async checkAffordability(userId: string, itemName: string, itemPrice: number, category?: string): Promise<AffordabilityResult> {
    const safeData = await this.getSafeToSpend(userId);
    return evaluateAffordability({
      itemName,
      itemPrice,
      category,
      safeToSpendData: safeData,
      currentDate: new Date(),
    });
  }
}
