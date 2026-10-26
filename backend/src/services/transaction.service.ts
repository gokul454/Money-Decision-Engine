import { Transaction, ITransaction } from '../models/Transaction.js';
import { FinancialProfile } from '../models/FinancialProfile.js';
import { getIsConnected } from '../config/database.js';

let memoryTransactions: any[] = [];

export interface TransactionFilter {
  type?: 'expense' | 'income' | 'transfer' | 'all';
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class TransactionService {
  static async list(userId: string, filter: TransactionFilter = {}) {
    if (getIsConnected()) {
      const query: any = { userId };
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
        if (filter.startDate) query.transactionDate.$gte = new Date(filter.startDate);
        if (filter.endDate) query.transactionDate.$lte = new Date(filter.endDate);
      }

      const txs = await Transaction.find(query).sort({ transactionDate: -1, createdAt: -1 });
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
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(s) ||
          t.merchant?.toLowerCase().includes(s) ||
          t.category?.toLowerCase().includes(s)
      );
    }
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  }

  static async create(userId: string, data: Partial<ITransaction>) {
    const txDate = data.transactionDate ? new Date(data.transactionDate) : new Date();
    const timeOfDay = data.timeOfDay || `${String(txDate.getHours()).padStart(2, '0')}:${String(txDate.getMinutes()).padStart(2, '0')}`;

    if (getIsConnected()) {
      const created = await Transaction.create({
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
        await FinancialProfile.findOneAndUpdate({ userId }, { $inc: { currentLiquidBalance: -Number(data.amount) } });
      } else if (data.type === 'income') {
        await FinancialProfile.findOneAndUpdate({ userId }, { $inc: { currentLiquidBalance: Number(data.amount) } });
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

  static async getById(userId: string, id: string) {
    if (getIsConnected()) {
      return await Transaction.findOne({ _id: id, userId });
    }
    return memoryTransactions.find((t) => (t._id === id || t.id === id) && t.userId === userId) || null;
  }

  static async update(userId: string, id: string, data: Partial<ITransaction>) {
    if (getIsConnected()) {
      return await Transaction.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
    }
    const idx = memoryTransactions.findIndex((t) => (t._id === id || t.id === id) && t.userId === userId);
    if (idx !== -1) {
      memoryTransactions[idx] = { ...memoryTransactions[idx], ...data, updatedAt: new Date() };
      return memoryTransactions[idx];
    }
    return null;
  }

  static async delete(userId: string, id: string) {
    if (getIsConnected()) {
      const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
      return !!deleted;
    }
    const initialLen = memoryTransactions.length;
    memoryTransactions = memoryTransactions.filter((t) => !((t._id === id || t.id === id) && t.userId === userId));
    return memoryTransactions.length < initialLen;
  }

  static setMemoryTransactions(txs: any[]) {
    memoryTransactions = [...txs];
  }
}
