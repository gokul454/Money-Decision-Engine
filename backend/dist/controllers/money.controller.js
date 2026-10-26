"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffordabilityController = exports.MoneyController = void 0;
const money_service_js_1 = require("../services/money.service.js");
class MoneyController {
    static async getOverview(req, res) {
        try {
            const data = await money_service_js_1.MoneyService.getOverview(req.userId);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getSafeToSpend(req, res) {
        try {
            const data = await money_service_js_1.MoneyService.getSafeToSpend(req.userId);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getHealthScore(req, res) {
        try {
            const data = await money_service_js_1.MoneyService.getHealthScore(req.userId);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getRunway(req, res) {
        try {
            const data = await money_service_js_1.MoneyService.getRunway(req.userId);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getForecast(req, res) {
        try {
            const horizon = req.query.horizon;
            const data = await money_service_js_1.MoneyService.getForecast(req.userId, horizon);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.MoneyController = MoneyController;
class AffordabilityController {
    static async check(req, res) {
        try {
            const { itemName, itemPrice, category } = req.body;
            if (!itemName || itemPrice === undefined) {
                res.status(400).json({ success: false, message: 'itemName and itemPrice are required.' });
                return;
            }
            const evaluation = await money_service_js_1.MoneyService.checkAffordability(req.userId, itemName, Number(itemPrice), category);
            res.json({ success: true, data: evaluation });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AffordabilityController = AffordabilityController;
