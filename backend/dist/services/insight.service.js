"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightService = void 0;
const insight_engine_js_1 = require("../engines/insight.engine.js");
const transaction_service_js_1 = require("./transaction.service.js");
class InsightService {
    static async getInsights(userId) {
        const transactions = await transaction_service_js_1.TransactionService.list(userId);
        const mapped = transactions.map((t) => ({
            category: t.category,
            amount: t.amount,
            type: t.type,
            timeOfDay: t.timeOfDay,
            isImpulse: t.isImpulse,
            transactionDate: new Date(t.transactionDate),
        }));
        return (0, insight_engine_js_1.analyzeSpendingInsights)(mapped, 7460);
    }
}
exports.InsightService = InsightService;
