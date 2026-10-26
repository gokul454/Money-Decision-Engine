"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFinancialRunway = calculateFinancialRunway;
function calculateFinancialRunway(input) {
    const monthlyBurn = input.fixedMonthlyExpenses + input.averageMonthlyDiscretionarySpend;
    const dailyBurn = Math.max(1, monthlyBurn / 30);
    const runwayDays = Math.round(input.availableBalance / dailyBurn);
    const runwayMonths = Number((input.availableBalance / Math.max(1, monthlyBurn)).toFixed(1));
    const reserveOnlyDays = Math.round(input.emergencyReserve / dailyBurn);
    let status = 'HEALTHY';
    let statusText = 'Comfortable runway';
    if (runwayDays < 30) {
        status = 'CRITICAL';
        statusText = 'Less than 1 month buffer';
    }
    else if (runwayDays < 60) {
        status = 'MODERATE';
        statusText = '1-2 months buffer';
    }
    else {
        statusText = `${runwayMonths} months buffer`;
    }
    return {
        runwayDays,
        runwayMonths,
        dailyBurnRate: Math.round(dailyBurn),
        monthlyBurnRate: Math.round(monthlyBurn),
        status,
        statusText,
        reserveOnlyDays,
    };
}
