import { RecurringExpense, IRecurringExpense } from '../models/RecurringExpense.js';
import { getIsConnected } from '../config/database.js';

let memoryRecurring: any[] = [];

export class RecurringService {
  static async list(userId: string) {
    if (getIsConnected()) {
      return await RecurringExpense.find({ userId }).sort({ nextDueDate: 1 });
    }
    const list = memoryRecurring.filter((r) => r.userId.toString() === userId.toString());
    list.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    return list;
  }

  static async create(userId: string, data: Partial<IRecurringExpense>) {
    if (getIsConnected()) {
      return await RecurringExpense.create({
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

  static async update(userId: string, id: string, data: Partial<IRecurringExpense>) {
    if (getIsConnected()) {
      return await RecurringExpense.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
    }
    const idx = memoryRecurring.findIndex((r) => (r._id === id || r.id === id) && r.userId === userId);
    if (idx !== -1) {
      memoryRecurring[idx] = { ...memoryRecurring[idx], ...data, updatedAt: new Date() };
      return memoryRecurring[idx];
    }
    return null;
  }

  static async delete(userId: string, id: string) {
    if (getIsConnected()) {
      const deleted = await RecurringExpense.findOneAndDelete({ _id: id, userId });
      return !!deleted;
    }
    const len = memoryRecurring.length;
    memoryRecurring = memoryRecurring.filter((r) => !((r._id === id || r.id === id) && r.userId === userId));
    return memoryRecurring.length < len;
  }

  static setMemoryRecurring(items: any[]) {
    memoryRecurring = [...items];
  }
}
