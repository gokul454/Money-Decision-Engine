"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = exports.InsightController = exports.RecurringController = exports.GoalController = void 0;
const goal_service_js_1 = require("../services/goal.service.js");
const recurring_service_js_1 = require("../services/recurring.service.js");
const insight_service_js_1 = require("../services/insight.service.js");
const profile_service_js_1 = require("../services/profile.service.js");
class GoalController {
    static async list(req, res) {
        try {
            const status = req.query.status;
            const goals = await goal_service_js_1.GoalService.list(req.userId, status);
            res.json({ success: true, count: goals.length, data: goals });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async create(req, res) {
        try {
            const goal = await goal_service_js_1.GoalService.create(req.userId, req.body);
            res.status(201).json({ success: true, data: goal });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async update(req, res) {
        try {
            const id = String(req.params.id);
            const goal = await goal_service_js_1.GoalService.update(req.userId, id, req.body);
            if (!goal) {
                res.status(404).json({ success: false, message: 'Goal not found' });
                return;
            }
            res.json({ success: true, data: goal });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const id = String(req.params.id);
            const deleted = await goal_service_js_1.GoalService.delete(req.userId, id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Goal not found' });
                return;
            }
            res.json({ success: true, message: 'Goal deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.GoalController = GoalController;
class RecurringController {
    static async list(req, res) {
        try {
            const recurring = await recurring_service_js_1.RecurringService.list(req.userId);
            res.json({ success: true, count: recurring.length, data: recurring });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async create(req, res) {
        try {
            const rec = await recurring_service_js_1.RecurringService.create(req.userId, req.body);
            res.status(201).json({ success: true, data: rec });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async update(req, res) {
        try {
            const id = String(req.params.id);
            const rec = await recurring_service_js_1.RecurringService.update(req.userId, id, req.body);
            if (!rec) {
                res.status(404).json({ success: false, message: 'Recurring expense not found' });
                return;
            }
            res.json({ success: true, data: rec });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const id = String(req.params.id);
            const deleted = await recurring_service_js_1.RecurringService.delete(req.userId, id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Recurring expense not found' });
                return;
            }
            res.json({ success: true, message: 'Recurring expense deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.RecurringController = RecurringController;
class InsightController {
    static async getInsights(req, res) {
        try {
            const insights = await insight_service_js_1.InsightService.getInsights(req.userId);
            res.json({ success: true, data: insights });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.InsightController = InsightController;
class ProfileController {
    static async getProfile(req, res) {
        try {
            const profile = await profile_service_js_1.ProfileService.getProfile(req.userId);
            res.json({ success: true, data: profile });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const updated = await profile_service_js_1.ProfileService.updateProfile(req.userId, req.body);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ProfileController = ProfileController;
