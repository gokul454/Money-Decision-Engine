"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringService = void 0;
const RecurringExpense_js_1 = require("../models/RecurringExpense.js");
const database_js_1 = require("../config/database.js");
let memoryRecurring = [];
class RecurringService {
    static async list(userId) {
        if ((0, database_js_1.getIsConnected)()) {
            return await RecurringExpense_js_1.RecurringExpense.find({ userId }).sort({ nextDueDate: 1 });
        }
        const list = memoryRecurring.filter((r) => r.userId.toString() === userId.toString());
        list.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
        return list;
    }
    static async create(userId, data) {
        if ((0, database_js_1.getIsConnected)()) {
            return await RecurringExpense_js_1.RecurringExpense.create({
                userId,
                name: data.name,
                amount: Number(data.amount),
                frequency: data.frequency || 'monthly',
                nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : new Date(Date.now() + 7 * 86400000),
                category: data.category || 'Bills & Utilities',
                icon: data.icon || 'Receipt',
                isAutoPaid: data.isAutoPaid || false,
            });
        }
        const r = {
            _id: 'rec_' + Date.now(),
            id: 'rec_' + Date.now(),
            userId,
            name: data.name,
            amount: Number(data.amount),
            frequency: data.frequency || 'monthly',
            nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : new Date(Date.now() + 7 * 86400000),
            category: data.category || 'Bills & Utilities',
            icon: data.icon || 'Receipt',
            isAutoPaid: data.isAutoPaid || false,
            createdAt: new Date(),
        };
        memoryRecurring.push(r);
        return r;
    }
    static async update(userId, id, data) {
        if ((0, database_js_1.getIsConnected)()) {
            return await RecurringExpense_js_1.RecurringExpense.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
        }
        const idx = memoryRecurring.findIndex((r) => (r._id === id || r.id === id) && r.userId === userId);
        if (idx !== -1) {
            memoryRecurring[idx] = { ...memoryRecurring[idx], ...data, updatedAt: new Date() };
            return memoryRecurring[idx];
        }
        return null;
    }
    static async delete(userId, id) {
        if ((0, database_js_1.getIsConnected)()) {
            const deleted = await RecurringExpense_js_1.RecurringExpense.findOneAndDelete({ _id: id, userId });
            return !!deleted;
        }
        const len = memoryRecurring.length;
        memoryRecurring = memoryRecurring.filter((r) => !((r._id === id || r.id === id) && r.userId === userId));
        return memoryRecurring.length < len;
    }
    static setMemoryRecurring(items) {
        memoryRecurring = [...items];
    }
}
exports.RecurringService = RecurringService;
