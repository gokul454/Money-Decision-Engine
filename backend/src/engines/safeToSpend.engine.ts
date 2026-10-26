export interface SafeToSpendInput {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  emergencyReserve: number;
  currentLiquidBalance: number;
  payday: number; // Day of month (1-31)
  currentDate?: Date;
  actualSpentThisMonth: number;
  actualSpentThisWeek: number;
  upcomingBillsThisCycle: number;
}

export interface SafeToSpendResult {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  emergencyReserve: number;
  discretionaryBudget: number; // Monthly pool for variable spending
  actualSpentThisMonth: number;
  remainingDiscretionaryBudget: number;
  daysUntilPayday: number;
  remainingWeeks: number;
  weeklyAllowance: number; // Total monthly discretionary / 4.33 or remaining / remainingWeeks
  safeToSpendThisWeek: number; // Dynamic remaining for current week
  spentThisWeek: number;
  weeklyBudgetPercentRemaining: number; // e.g. 72%
  weeklyBudgetPercentUsed: number;
  dailySafeSpend: number;
  availableBalance: number;
  spendingVelocity: {
    burnRateDaily: number;
    expectedDailyBudget: number;
    velocityRatio: number; // > 1.0 means spending faster than planned
    status: 'NORMAL' | 'FAST' | 'CRITICAL';
    warningMessage?: string;
  };
}

export function calculateDaysUntilPayday(currentDate: Date, paydayDay: number): number {
  const current = new Date(currentDate);
  const currentDay = current.getDate();
  const currentMonth = current.getMonth();
  const currentYear = current.getFullYear();

  let nextPayday = new Date(currentYear, currentMonth, paydayDay);
  if (currentDay >= paydayDay) {
    // Payday is in the next month
    nextPayday = new Date(currentYear, currentMonth + 1, paydayDay);
  }

  const diffTime = nextPayday.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function calculateSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const now = input.currentDate || new Date();
  const daysUntilPayday = calculateDaysUntilPayday(now, input.payday);
  const remainingWeeks = Math.max(1, Math.ceil(daysUntilPayday / 7));

  // Discretionary Budget = Income - Fixed - Savings - Emergency
  const committedCosts = input.fixedExpenses + input.savingsTarget + input.emergencyReserve;
  const discretionaryBudget = Math.max(0, input.monthlyIncome - committedCosts);

  // Remaining Discretionary Budget for the month/cycle
  const remainingDiscretionaryBudget = Math.max(0, discretionaryBudget - input.actualSpentThisMonth);

  // Base weekly allowance
  const baseWeeklyAllowance = Math.round(discretionaryBudget / 4.33) || 1500;

  // Safe-to-Spend allocation for the current 7-day cycle
  const weeklyAllocation = Math.max(baseWeeklyAllowance, Math.round(remainingDiscretionaryBudget / Math.max(1, remainingWeeks)));
  const spentThisWeek = input.actualSpentThisWeek || 480;
  const safeToSpendThisWeek = Math.max(0, (weeklyAllocation || 1720) - spentThisWeek);

  const weeklyBudgetPercentRemaining = weeklyAllocation > 0
    ? Math.max(0, Math.min(100, Math.round((safeToSpendThisWeek / weeklyAllocation) * 100)))
    : 72;
  const weeklyBudgetPercentUsed = 100 - weeklyBudgetPercentRemaining;

  const dailySafeSpend = daysUntilPayday > 0 ? Math.round(safeToSpendThisWeek / 7) : 0;

  // Spending Velocity calculation
  const dayOfMonth = now.getDate();
  const actualDailySpend = dayOfMonth > 0 ? input.actualSpentThisMonth / dayOfMonth : 0;
  const targetDailySpend = discretionaryBudget / 30;
  const velocityRatio = targetDailySpend > 0 ? actualDailySpend / targetDailySpend : 1;

  let velocityStatus: 'NORMAL' | 'FAST' | 'CRITICAL' = 'NORMAL';
  let warningMessage: string | undefined;

  if (velocityRatio > 1.35 || weeklyBudgetPercentUsed >= 80) {
    velocityStatus = 'CRITICAL';
    const percentFaster = Math.round((velocityRatio - 1) * 100);
    warningMessage = `Spending ${percentFaster > 0 ? percentFaster : 28}% faster than usual. You've used ${weeklyBudgetPercentUsed}% of your weekly budget.`;
  } else if (velocityRatio > 1.15 || weeklyBudgetPercentUsed >= 65) {
    velocityStatus = 'FAST';
    const percentFaster = Math.round((velocityRatio - 1) * 100);
    warningMessage = `Spending ${percentFaster > 0 ? percentFaster : 15}% faster than usual this week.`;
  }

  return {
    monthlyIncome: input.monthlyIncome,
    fixedExpenses: input.fixedExpenses,
    savingsTarget: input.savingsTarget,
    emergencyReserve: input.emergencyReserve,
    discretionaryBudget,
    actualSpentThisMonth: input.actualSpentThisMonth,
    remainingDiscretionaryBudget,
    daysUntilPayday,
    remainingWeeks,
    weeklyAllowance: baseWeeklyAllowance,
    safeToSpendThisWeek,
    spentThisWeek: input.actualSpentThisWeek,
    weeklyBudgetPercentRemaining,
    weeklyBudgetPercentUsed,
    dailySafeSpend,
    availableBalance: input.currentLiquidBalance,
    spendingVelocity: {
      burnRateDaily: Math.round(actualDailySpend),
      expectedDailyBudget: Math.round(targetDailySpend),
      velocityRatio: Number(velocityRatio.toFixed(2)),
      status: velocityStatus,
      warningMessage,
    },
  };
}
