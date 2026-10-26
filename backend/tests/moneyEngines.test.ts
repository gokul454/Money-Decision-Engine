import { describe, it, expect } from 'vitest';
import { calculateSafeToSpend } from '../src/engines/safeToSpend.engine.js';
import { evaluateAffordability } from '../src/engines/affordability.engine.js';
import { calculateMoneyHealthScore } from '../src/engines/healthScore.engine.js';
import { calculateFinancialRunway } from '../src/engines/runway.engine.js';
import { generateFinancialForecasts } from '../src/engines/forecast.engine.js';
import { analyzeSpendingInsights } from '../src/engines/insight.engine.js';

describe('Money OS Financial Engines', () => {
  const baseInput = {
    monthlyIncome: 15000,
    fixedExpenses: 5000,
    savingsTarget: 2000,
    emergencyReserve: 2000,
    currentLiquidBalance: 8420,
    payday: 1, // 1st of month
    currentDate: new Date('2026-08-20T10:00:00Z'), // 12 days to 1st Sep
    actualSpentThisMonth: 8580,
    actualSpentThisWeek: 480,
    upcomingBillsThisCycle: 699 + 649,
  };

  it('calculates Safe-to-Spend correctly according to the formula', () => {
    const result = calculateSafeToSpend(baseInput);

    // Discretionary budget = 15000 - (5000 + 2000 + 2000 + 1348) = 4652
    expect(result.monthlyIncome).toBe(15000);
    expect(result.fixedExpenses).toBe(5000);
    expect(result.daysUntilPayday).toBe(12);
    expect(result.safeToSpendThisWeek).toBeGreaterThanOrEqual(0);
    expect(result.availableBalance).toBe(8420);
    expect(result.spendingVelocity).toBeDefined();
  });

  it('evaluates Affordability for Sony Headphones ₹2,499 with NOT_RECOMMENDED verdict', () => {
    const safeData = calculateSafeToSpend({
      ...baseInput,
      actualSpentThisWeek: 260,
    });
    // Set safe to spend this week to 1240 as in reference design
    safeData.safeToSpendThisWeek = 1240;

    const evalResult = evaluateAffordability({
      itemName: 'Sony WH-1000XM5 Headphones',
      itemPrice: 2499,
      safeToSpendData: safeData,
      currentDate: new Date('2026-08-20T10:00:00Z'),
    });

    expect(evalResult.verdict).toBe('NOT_RECOMMENDED');
    expect(evalResult.verdictBadge).toBe('Not Recommended (Yet)');
    expect(evalResult.difference).toBe(-1259);
    expect(evalResult.impacts.savingsGoal).toBe('Affected');
    expect(evalResult.betterOption.recommendedWaitDays).toBeGreaterThan(0);
  });

  it('evaluates Affordability for ₹240 Starbucks Coffee as SAFE', () => {
    const safeData = calculateSafeToSpend(baseInput);
    safeData.safeToSpendThisWeek = 1240;

    const evalResult = evaluateAffordability({
      itemName: 'Starbucks Latte',
      itemPrice: 240,
      safeToSpendData: safeData,
    });

    expect(evalResult.verdict).toBe('SAFE');
    expect(evalResult.verdictBadge).toBe('Safe to Buy');
    expect(evalResult.impacts.foodBudget).toBe('Safe');
  });

  it('calculates Health Score between 0 and 100 with explainable pillars', () => {
    const safeData = calculateSafeToSpend(baseInput);
    const health = calculateMoneyHealthScore({
      safeToSpendData: safeData,
      goalCompletionRate: 0.85,
    });

    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(health.pillars.spendingControl).toBeDefined();
    expect(health.pillars.savingsHabit).toBeDefined();
    expect(health.pillars.budgetAdherence).toBeDefined();
    expect(health.pillars.financialStability).toBeDefined();
    expect(health.trend.length).toBe(7);
  });

  it('generates multi-horizon forecasts with +500/month improvements', () => {
    const forecasts = generateFinancialForecasts({
      monthlyIncome: 15000,
      currentMonthlySavings: 2000,
      discretionarySpending: 6000,
      improvedMonthlyDelta: 500,
    });

    expect(forecasts['30days']).toBeDefined();
    expect(forecasts['6months']).toBeDefined();
    expect(forecasts['1year']).toBeDefined();
    expect(forecasts['5years']).toBeDefined();

    expect(forecasts['6months'].improvedTotal).toBeGreaterThan(forecasts['6months'].baselineTotal);
    expect(forecasts['5years'].improvedTotal).toBeGreaterThan(forecasts['5years'].baselineTotal);
  });

  it('analyzes spending insights and behavioral patterns', () => {
    const txs = [
      { category: 'Food & Dining', amount: 2340, type: 'expense' as const, timeOfDay: '21:30', transactionDate: new Date() },
      { category: 'Shopping', amount: 1850, type: 'expense' as const, isImpulse: true, transactionDate: new Date() },
      { category: 'Transport', amount: 1120, type: 'expense' as const, transactionDate: new Date() },
      { category: 'Entertainment', amount: 850, type: 'expense' as const, transactionDate: new Date() },
      { category: 'Bills & Utilities', amount: 720, type: 'expense' as const, transactionDate: new Date() },
      { category: 'Others', amount: 1700, type: 'expense' as const, transactionDate: new Date() },
    ];

    const insights = analyzeSpendingInsights(txs, 7460);
    expect(insights.totalSpent).toBe(8580);
    expect(insights.categories.length).toBe(6);
    expect(insights.categories[0].category).toBe('Food & Dining');
    expect(insights.categories[0].percentage).toBe(27);
    expect(insights.behavioralInsights.length).toBeGreaterThanOrEqual(2);
  });
});
