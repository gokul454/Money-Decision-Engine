"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyService = void 0;
const safeToSpend_engine_js_1 = require("../engines/safeToSpend.engine.js");
const healthScore_engine_js_1 = require("../engines/healthScore.engine.js");
const runway_engine_js_1 = require("../engines/runway.engine.js");
const forecast_engine_js_1 = require("../engines/forecast.engine.js");
const affordability_engine_js_1 = require("../engines/affordability.engine.js");
const profile_service_js_1 = require("./profile.service.js");
const transaction_service_js_1 = require("./transaction.service.js");
const recurring_service_js_1 = require("./recurring.service.js");
const goal_service_js_1 = require("./goal.service.js");
class MoneyService {
    static async getOverview(userId) {
        const profileData = await profile_service_js_1.ProfileService.getProfile(userId);
        const p = profileData.financial;
        const allTransactions = await transaction_service_js_1.TransactionService.list(userId);
        const recurringList = await recurring_service_js_1.RecurringService.list(userId);
        const goalsList = await goal_service_js_1.GoalService.list(userId);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Expenses this month
        const thisMonthExpenses = allTransactions.filter((t) => {
            const d = new Date(t.transactionDate);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const actualSpentThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
        // Expenses this week (last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        const thisWeekExpenses = allTransactions.filter((t) => {
            const d = new Date(t.transactionDate);
            return t.type === 'expense' && d >= sevenDaysAgo;
        });
        const actualSpentThisWeek = thisWeekExpenses.reduce((sum, t) => sum + t.amount, 0);
        // Upcoming recurring bills in this cycle
        const upcomingBills = recurringList.reduce((sum, r) => sum + r.amount, 0);
        // Total income this month
        const thisMonthIncome = allTransactions
            .filter((t) => {
            const d = new Date(t.transactionDate);
            return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
            .reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = thisMonthIncome > 0 ? thisMonthIncome : p.monthlyIncome;
        // Run Safe-To-Spend Engine
        const safeToSpend = (0, safeToSpend_engine_js_1.calculateSafeToSpend)({
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
        const healthScore = (0, healthScore_engine_js_1.calculateMoneyHealthScore)({
            safeToSpendData: safeToSpend,
            goalCompletionRate: goalsList.length > 0 ? 0.85 : 0.6,
        });
        // Run Runway Engine
        const runway = (0, runway_engine_js_1.calculateFinancialRunway)({
            availableBalance: p.currentLiquidBalance,
            fixedMonthlyExpenses: p.fixedExpenses,
            averageMonthlyDiscretionarySpend: safeToSpend.discretionaryBudget,
            emergencyReserve: p.emergencyReserve,
        });
        // Calculate Top Spending Categories
        const catTotals = {};
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
    static async getSafeToSpend(userId) {
        const overview = await this.getOverview(userId);
        return overview.safeToSpend;
    }
    static async getHealthScore(userId) {
        const overview = await this.getOverview(userId);
        return overview.healthScore;
    }
    static async getRunway(userId) {
        const overview = await this.getOverview(userId);
        return overview.runway;
    }
    static async getForecast(userId, horizon) {
        const overview = await this.getOverview(userId);
        const forecasts = (0, forecast_engine_js_1.generateFinancialForecasts)({
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
    static async checkAffordability(userId, itemName, itemPrice, category) {
        const safeData = await this.getSafeToSpend(userId);
        return (0, affordability_engine_js_1.evaluateAffordability)({
            itemName,
            itemPrice,
            category,
            safeToSpendData: safeData,
            currentDate: new Date(),
        });
    }
}
exports.MoneyService = MoneyService;
