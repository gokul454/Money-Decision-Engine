"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const Goal_js_1 = require("../models/Goal.js");
const database_js_1 = require("../config/database.js");
let memoryGoals = [];
class GoalService {
    static async list(userId, status) {
        if ((0, database_js_1.getIsConnected)()) {
            const query = { userId };
            if (status && status !== 'all') {
                query.status = status;
            }
            return await Goal_js_1.Goal.find(query).sort({ priority: 1, createdAt: -1 });
        }
        let list = memoryGoals.filter((g) => g.userId.toString() === userId.toString());
        if (status && status !== 'all') {
            list = list.filter((g) => g.status === status);
        }
        return list;
    }
    static async create(userId, data) {
        if ((0, database_js_1.getIsConnected)()) {
            return await Goal_js_1.Goal.create({
                userId,
                name: data.name,
                categoryIcon: data.categoryIcon || 'Target',
                targetAmount: Number(data.targetAmount),
                currentAmount: Number(data.currentAmount || 0),
                targetDate: data.targetDate ? new Date(data.targetDate) : new Date(Date.now() + 90 * 86400000),
                monthlyContribution: Number(data.monthlyContribution || 0),
                status: data.status || 'active',
            });
        }
        const g = {
            _id: 'goal_' + Date.now(),
            id: 'goal_' + Date.now(),
            userId,
            name: data.name,
            categoryIcon: data.categoryIcon || 'Target',
            targetAmount: Number(data.targetAmount),
            currentAmount: Number(data.currentAmount || 0),
            targetDate: data.targetDate ? new Date(data.targetDate) : new Date(Date.now() + 90 * 86400000),
            monthlyContribution: Number(data.monthlyContribution || 0),
            status: data.status || 'active',
            createdAt: new Date(),
        };
        memoryGoals.push(g);
        return g;
    }
    static async update(userId, id, data) {
        if ((0, database_js_1.getIsConnected)()) {
            return await Goal_js_1.Goal.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
        }
        const idx = memoryGoals.findIndex((g) => (g._id === id || g.id === id) && g.userId === userId);
        if (idx !== -1) {
            memoryGoals[idx] = { ...memoryGoals[idx], ...data, updatedAt: new Date() };
            return memoryGoals[idx];
        }
        return null;
    }
    static async delete(userId, id) {
        if ((0, database_js_1.getIsConnected)()) {
            const deleted = await Goal_js_1.Goal.findOneAndDelete({ _id: id, userId });
            return !!deleted;
        }
        const len = memoryGoals.length;
        memoryGoals = memoryGoals.filter((g) => !((g._id === id || g.id === id) && g.userId === userId));
        return memoryGoals.length < len;
    }
    static setMemoryGoals(goals) {
        memoryGoals = [...goals];
    }
}
exports.GoalService = GoalService;
