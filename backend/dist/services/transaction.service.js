"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const Transaction_js_1 = require("../models/Transaction.js");
const FinancialProfile_js_1 = require("../models/FinancialProfile.js");
const database_js_1 = require("../config/database.js");
let memoryTransactions = [];
class TransactionService {
    static async list(userId, filter = {}) {
        if ((0, database_js_1.getIsConnected)()) {
            const query = { userId };
            if (filter.type && filter.type !== 'all') {
                query.type = filter.type;
            }
            if (filter.category && filter.category !== 'All') {
                query.category = filter.category;
            }
            if (filter.search) {
                query.$or = [
                    { description: { $regex: filter.search, $options: 'i' } },
                    { merchant: { $regex: filter.search, $options: 'i' } },
                    { category: { $regex: filter.search, $options: 'i' } },
                ];
            }
            if (filter.startDate || filter.endDate) {
                query.transactionDate = {};
                if (filter.startDate)
                    query.transactionDate.$gte = new Date(filter.startDate);
                if (filter.endDate)
                    query.transactionDate.$lte = new Date(filter.endDate);
            }
            const txs = await Transaction_js_1.Transaction.find(query).sort({ transactionDate: -1, createdAt: -1 });
            return txs;
        }
        let list = memoryTransactions.filter((t) => t.userId.toString() === userId.toString());
        if (filter.type && filter.type !== 'all') {
            list = list.filter((t) => t.type === filter.type);
        }
        if (filter.category && filter.category !== 'All') {
            list = list.filter((t) => t.category.toLowerCase() === filter.category?.toLowerCase());
        }
        if (filter.search) {
            const s = filter.search.toLowerCase();
            list = list.filter((t) => t.description?.toLowerCase().includes(s) ||
                t.merchant?.toLowerCase().includes(s) ||
                t.category?.toLowerCase().includes(s));
        }
        list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        return list;
    }
    static async create(userId, data) {
        const txDate = data.transactionDate ? new Date(data.transactionDate) : new Date();
        const timeOfDay = data.timeOfDay || `${String(txDate.getHours()).padStart(2, '0')}:${String(txDate.getMinutes()).padStart(2, '0')}`;
        if ((0, database_js_1.getIsConnected)()) {
            const created = await Transaction_js_1.Transaction.create({
                userId,
                type: data.type || 'expense',
                amount: Number(data.amount),
                category: data.category || 'Other',
                description: data.description || 'Expense',
                merchant: data.merchant || data.description,
                paymentMethod: data.paymentMethod || 'UPI',
                transactionDate: txDate,
                notes: data.notes || '',
                isImpulse: data.isImpulse || false,
                timeOfDay,
            });
            // Update liquid balance on financial profile
            if (data.type === 'expense') {
                await FinancialProfile_js_1.FinancialProfile.findOneAndUpdate({ userId }, { $inc: { currentLiquidBalance: -Number(data.amount) } });
            }
            else if (data.type === 'income') {
                await FinancialProfile_js_1.FinancialProfile.findOneAndUpdate({ userId }, { $inc: { currentLiquidBalance: Number(data.amount) } });
            }
            return created;
        }
        const newTx = {
            _id: 'tx_' + Date.now(),
            id: 'tx_' + Date.now(),
            userId,
            type: data.type || 'expense',
            amount: Number(data.amount),
            category: data.category || 'Other',
            description: data.description || 'Expense',
            merchant: data.merchant || data.description,
            paymentMethod: data.paymentMethod || 'UPI',
            transactionDate: txDate,
            notes: data.notes || '',
            isImpulse: data.isImpulse || false,
            timeOfDay,
            createdAt: new Date(),
        };
        memoryTransactions.unshift(newTx);
        return newTx;
    }
    static async getById(userId, id) {
        if ((0, database_js_1.getIsConnected)()) {
            return await Transaction_js_1.Transaction.findOne({ _id: id, userId });
        }
        return memoryTransactions.find((t) => (t._id === id || t.id === id) && t.userId === userId) || null;
    }
    static async update(userId, id, data) {
        if ((0, database_js_1.getIsConnected)()) {
            return await Transaction_js_1.Transaction.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
        }
        const idx = memoryTransactions.findIndex((t) => (t._id === id || t.id === id) && t.userId === userId);
        if (idx !== -1) {
            memoryTransactions[idx] = { ...memoryTransactions[idx], ...data, updatedAt: new Date() };
            return memoryTransactions[idx];
        }
        return null;
    }
    static async delete(userId, id) {
        if ((0, database_js_1.getIsConnected)()) {
            const deleted = await Transaction_js_1.Transaction.findOneAndDelete({ _id: id, userId });
            return !!deleted;
        }
        const initialLen = memoryTransactions.length;
        memoryTransactions = memoryTransactions.filter((t) => !((t._id === id || t.id === id) && t.userId === userId));
        return memoryTransactions.length < initialLen;
    }
    static setMemoryTransactions(txs) {
        memoryTransactions = [...txs];
    }
}
exports.TransactionService = TransactionService;
