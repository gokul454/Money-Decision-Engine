"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_js_1 = require("../services/transaction.service.js");
class TransactionController {
    static async list(req, res) {
        try {
            const { type, category, search, startDate, endDate, limit } = req.query;
            const txs = await transaction_service_js_1.TransactionService.list(req.userId, {
                type: type,
                category: category,
                search: search,
                startDate: startDate,
                endDate: endDate,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({ success: true, count: txs.length, data: txs });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async create(req, res) {
        try {
            const tx = await transaction_service_js_1.TransactionService.create(req.userId, req.body);
            res.status(201).json({ success: true, data: tx });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async getById(req, res) {
        try {
            const id = String(req.params.id);
            const tx = await transaction_service_js_1.TransactionService.getById(req.userId, id);
            if (!tx) {
                res.status(404).json({ success: false, message: 'Transaction not found' });
                return;
            }
            res.json({ success: true, data: tx });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async update(req, res) {
        try {
            const id = String(req.params.id);
            const tx = await transaction_service_js_1.TransactionService.update(req.userId, id, req.body);
            if (!tx) {
                res.status(404).json({ success: false, message: 'Transaction not found' });
                return;
            }
            res.json({ success: true, data: tx });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const id = String(req.params.id);
            const deleted = await transaction_service_js_1.TransactionService.delete(req.userId, id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Transaction not found' });
                return;
            }
            res.json({ success: true, message: 'Transaction deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.TransactionController = TransactionController;
