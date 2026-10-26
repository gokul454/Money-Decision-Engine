"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDaysUntilPayday = calculateDaysUntilPayday;
exports.calculateSafeToSpend = calculateSafeToSpend;
function calculateDaysUntilPayday(currentDate, paydayDay) {
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
function calculateSafeToSpend(input) {
    const now = input.currentDate || new Date();
    const daysUntilPayday = calculateDaysUntilPayday(now, input.payday);
    const remainingWeeks = Math.max(1, Math.ceil(daysUntilPayday / 7));
    // Discretionary Budget = Income - Fixed - Savings - Emergency - Upcoming Bills
    const committedCosts = input.fixedExpenses + input.savingsTarget + input.emergencyReserve + input.upcomingBillsThisCycle;
    const discretionaryBudget = Math.max(0, input.monthlyIncome - committedCosts);
    // Remaining Discretionary Budget for the month/cycle
    const remainingDiscretionaryBudget = Math.max(0, discretionaryBudget - input.actualSpentThisMonth);
    // Base weekly allowance
    const baseWeeklyAllowance = Math.round(discretionaryBudget / 4.33);
    // Dynamic Weekly Safe-to-Spend allocation
    const allocatedThisWeek = remainingWeeks > 0 ? Math.round(remainingDiscretionaryBudget / remainingWeeks) : remainingDiscretionaryBudget;
    const safeToSpendThisWeek = Math.max(0, allocatedThisWeek - input.actualSpentThisWeek);
    const weeklyBudgetPercentRemaining = allocatedThisWeek > 0
        ? Math.max(0, Math.min(100, Math.round((safeToSpendThisWeek / allocatedThisWeek) * 100)))
        : 0;
    const weeklyBudgetPercentUsed = 100 - weeklyBudgetPercentRemaining;
    const dailySafeSpend = daysUntilPayday > 0 ? Math.round(remainingDiscretionaryBudget / daysUntilPayday) : 0;
    // Spending Velocity calculation
    const dayOfMonth = now.getDate();
    const actualDailySpend = dayOfMonth > 0 ? input.actualSpentThisMonth / dayOfMonth : 0;
    const targetDailySpend = discretionaryBudget / 30;
    const velocityRatio = targetDailySpend > 0 ? actualDailySpend / targetDailySpend : 1;
    let velocityStatus = 'NORMAL';
    let warningMessage;
    if (velocityRatio > 1.35 || weeklyBudgetPercentUsed >= 80) {
        velocityStatus = 'CRITICAL';
        const percentFaster = Math.round((velocityRatio - 1) * 100);
        warningMessage = `Spending ${percentFaster > 0 ? percentFaster : 28}% faster than usual. You've used ${weeklyBudgetPercentUsed}% of your weekly budget.`;
    }
    else if (velocityRatio > 1.15 || weeklyBudgetPercentUsed >= 65) {
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
