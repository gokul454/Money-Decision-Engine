"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFinancialForecasts = generateFinancialForecasts;
function generateFinancialForecasts(input) {
    const currentMonthlySavings = Math.max(500, input.currentMonthlySavings);
    const boost = input.improvedMonthlyDelta || 500;
    const improvedMonthlySavings = currentMonthlySavings + boost;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    // 1. 30 Days (Weeks 1 to 4)
    const chart30d = [
        { period: 'Week 1', baselineSavings: Math.round(currentMonthlySavings * 0.25), improvedSavings: Math.round(improvedMonthlySavings * 0.25) },
        { period: 'Week 2', baselineSavings: Math.round(currentMonthlySavings * 0.5), improvedSavings: Math.round(improvedMonthlySavings * 0.5) },
        { period: 'Week 3', baselineSavings: Math.round(currentMonthlySavings * 0.75), improvedSavings: Math.round(improvedMonthlySavings * 0.75) },
        { period: 'Week 4', baselineSavings: currentMonthlySavings, improvedSavings: improvedMonthlySavings },
    ];
    // 2. 6 Months
    const chart6m = [];
    for (let i = 1; i <= 6; i++) {
        const mName = monthNames[(currentMonthIdx + i - 1) % 12];
        chart6m.push({
            period: mName,
            baselineSavings: Math.round(currentMonthlySavings * i * (1 + (i * 0.015))), // slight compounding / variance
            improvedSavings: Math.round(improvedMonthlySavings * i * (1 + (i * 0.02))),
        });
    }
    // 3. 1 Year (12 months sampled bi-monthly)
    const chart1y = [];
    for (let i = 2; i <= 12; i += 2) {
        const mName = monthNames[(currentMonthIdx + i - 1) % 12];
        chart1y.push({
            period: mName,
            baselineSavings: Math.round(currentMonthlySavings * i * 1.05),
            improvedSavings: Math.round(improvedMonthlySavings * i * 1.08),
        });
    }
    // 4. 5 Years (Years 1 to 5 with 7% nominal annual investment return on saved funds)
    const chart5y = [];
    let baseCum = 0;
    let impCum = 0;
    for (let yr = 1; yr <= 5; yr++) {
        baseCum = (baseCum + currentMonthlySavings * 12) * 1.06;
        impCum = (impCum + improvedMonthlySavings * 12) * 1.07;
        chart5y.push({
            period: `Yr ${yr}`,
            baselineSavings: Math.round(baseCum),
            improvedSavings: Math.round(impCum),
        });
    }
    const getTotals = (chart) => {
        const last = chart[chart.length - 1];
        return {
            baseline: last.baselineSavings,
            improved: last.improvedSavings,
            diff: last.improvedSavings - last.baselineSavings,
        };
    };
    const t30d = getTotals(chart30d);
    const t6m = getTotals(chart6m);
    const t1y = getTotals(chart1y);
    const t5y = getTotals(chart5y);
    return {
        '30days': {
            horizon: '30days',
            label: '30 Days',
            baselineTotal: t30d.baseline,
            improvedTotal: t30d.improved,
            potentialImprovement: t30d.diff,
            monthlyBoostAmount: boost,
            chartData: chart30d,
            actionableTip: 'Skip 2 takeaway orders this week to keep ₹500 in your pocket.',
        },
        '6months': {
            horizon: '6months',
            label: '6 Months',
            baselineTotal: t6m.baseline,
            improvedTotal: t6m.improved,
            potentialImprovement: t6m.diff,
            monthlyBoostAmount: boost,
            chartData: chart6m,
            actionableTip: 'Reduce dining out by 2 times/week and save ~₹1,200/month.',
        },
        '1year': {
            horizon: '1year',
            label: '1 Year',
            baselineTotal: t1y.baseline,
            improvedTotal: t1y.improved,
            potentialImprovement: t1y.diff,
            monthlyBoostAmount: boost,
            chartData: chart1y,
            actionableTip: 'Switching subscriptions to annual plans saves an extra ~₹1,800/year.',
        },
        '5years': {
            horizon: '5years',
            label: '5 Years',
            baselineTotal: t5y.baseline,
            improvedTotal: t5y.improved,
            potentialImprovement: t5y.diff,
            monthlyBoostAmount: boost,
            chartData: chart5y,
            actionableTip: 'Investing your surplus into a low-cost index fund yields 7-10% compounding.',
        },
    };
}
