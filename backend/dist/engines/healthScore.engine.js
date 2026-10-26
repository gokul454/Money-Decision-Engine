"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMoneyHealthScore = calculateMoneyHealthScore;
function calculateMoneyHealthScore(input) {
    const { safeToSpendData } = input;
    const goalRate = input.goalCompletionRate ?? 0.8;
    const emergencyRatio = input.emergencyReserveFundedRatio ?? 1.0;
    const velocityRatio = safeToSpendData.spendingVelocity.velocityRatio;
    const percentUsed = safeToSpendData.weeklyBudgetPercentUsed;
    // 1. Spending Control (25 pts max)
    let spendingControlScore = 85;
    if (velocityRatio > 1.3 || percentUsed > 80) {
        spendingControlScore = 55;
    }
    else if (velocityRatio > 1.1 || percentUsed > 65) {
        spendingControlScore = 72;
    }
    else {
        spendingControlScore = 90;
    }
    // 2. Savings Habit (25 pts max)
    let savingsHabitScore = Math.round(Math.min(100, goalRate * 100));
    if (safeToSpendData.savingsTarget > 0) {
        savingsHabitScore = Math.max(70, savingsHabitScore);
    }
    // 3. Budget Adherence (25 pts max)
    let budgetScore = 75;
    const spendRatio = safeToSpendData.discretionaryBudget > 0
        ? safeToSpendData.actualSpentThisMonth / safeToSpendData.discretionaryBudget
        : 1;
    if (spendRatio > 0.9) {
        budgetScore = 60;
    }
    else if (spendRatio > 0.7) {
        budgetScore = 72;
    }
    else {
        budgetScore = 88;
    }
    // 4. Financial Stability (25 pts max)
    let stabilityScore = Math.round(Math.min(100, emergencyRatio * 85));
    if (safeToSpendData.availableBalance >= safeToSpendData.fixedExpenses * 1.5) {
        stabilityScore = Math.min(100, stabilityScore + 10);
    }
    const weightedTotal = Math.round(spendingControlScore * 0.25 +
        savingsHabitScore * 0.25 +
        budgetScore * 0.25 +
        stabilityScore * 0.25);
    const finalScore = Math.max(0, Math.min(100, weightedTotal));
    const getPillarStatus = (score) => {
        if (score >= 80)
            return 'Good';
        if (score >= 65)
            return 'Average';
        return 'Needs Improvement';
    };
    let statusLabel = "You're doing good!";
    if (finalScore < 50) {
        statusLabel = 'Critical Attention Needed';
    }
    else if (finalScore < 70) {
        statusLabel = 'Moderate Financial Risk';
    }
    const recommendations = [];
    if (budgetScore < 75) {
        recommendations.push('Discretionary spending is trending high. Slow down dining and shopping this week.');
    }
    if (spendingControlScore < 75) {
        recommendations.push("You've used over 70% of this week's budget early in the cycle.");
    }
    if (savingsHabitScore < 80) {
        recommendations.push('Automate your ₹2,000 monthly savings deposit right after payday.');
    }
    return {
        score: finalScore,
        statusLabel,
        trend: [70, 72, 73, 72, 75, 76, finalScore],
        deltaText: '+3 vs last month',
        pillars: {
            spendingControl: {
                name: 'Spending Control',
                score: spendingControlScore,
                status: getPillarStatus(spendingControlScore),
                description: 'Pacing and adherence to weekly allowance.',
            },
            savingsHabit: {
                name: 'Savings Habit',
                score: savingsHabitScore,
                status: getPillarStatus(savingsHabitScore),
                description: 'Consistency in meeting monthly targets & goals.',
            },
            budgetAdherence: {
                name: 'Budget Adherence',
                score: budgetScore,
                status: getPillarStatus(budgetScore),
                description: 'Staying within monthly discretionary budget bounds.',
            },
            financialStability: {
                name: 'Financial Stability',
                score: stabilityScore,
                status: getPillarStatus(stabilityScore),
                description: 'Emergency reserve runway and liquid cushion.',
            },
        },
        summaryRecommendations: recommendations,
    };
}
