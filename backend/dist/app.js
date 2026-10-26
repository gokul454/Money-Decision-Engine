"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const transaction_routes_js_1 = __importDefault(require("./routes/transaction.routes.js"));
const money_routes_js_1 = __importDefault(require("./routes/money.routes.js"));
const affordability_routes_js_1 = __importDefault(require("./routes/affordability.routes.js"));
const other_routes_js_1 = require("./routes/other.routes.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const demoData_js_1 = require("./seed/demoData.js");
exports.app = (0, express_1.default)();
// Middleware
exports.app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
exports.app.use(express_1.default.json());
// Health & Demo reset
exports.app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Money OS API',
        time: new Date().toISOString(),
        engine: 'active',
    });
});
exports.app.post('/api/seed/reset', async (req, res) => {
    try {
        await (0, demoData_js_1.seedDemoData)();
        res.json({ success: true, message: 'Demo data reset successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Routes
exports.app.use('/api/auth', auth_routes_js_1.default);
exports.app.use('/api/transactions', transaction_routes_js_1.default);
exports.app.use('/api/money', money_routes_js_1.default);
exports.app.use('/api/affordability', affordability_routes_js_1.default);
exports.app.use('/api/goals', other_routes_js_1.goalRouter);
exports.app.use('/api/recurring', other_routes_js_1.recurringRouter);
exports.app.use('/api/insights', other_routes_js_1.insightRouter);
exports.app.use('/api/profile', other_routes_js_1.profileRouter);
// Error handling
exports.app.use(error_middleware_js_1.errorHandler);
