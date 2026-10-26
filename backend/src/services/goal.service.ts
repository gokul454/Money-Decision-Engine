import { Goal, IGoal } from '../models/Goal.js';
import { getIsConnected } from '../config/database.js';

let memoryGoals: any[] = [];

export class GoalService {
  static async list(userId: string, status?: 'active' | 'completed' | 'all') {
    if (getIsConnected()) {
      const query: any = { userId };
      if (status && status !== 'all') {
        query.status = status;
      }
      return await Goal.find(query).sort({ priority: 1, createdAt: -1 });
    }

    let list = memoryGoals.filter((g) => g.userId.toString() === userId.toString());
    if (status && status !== 'all') {
      list = list.filter((g) => g.status === status);
    }
    return list;
  }

  static async create(userId: string, data: Partial<IGoal>) {
    if (getIsConnected()) {
      return await Goal.create({
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

  static async update(userId: string, id: string, data: Partial<IGoal>) {
    if (getIsConnected()) {
      return await Goal.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
    }
    const idx = memoryGoals.findIndex((g) => (g._id === id || g.id === id) && g.userId === userId);
    if (idx !== -1) {
      memoryGoals[idx] = { ...memoryGoals[idx], ...data, updatedAt: new Date() };
      return memoryGoals[idx];
    }
    return null;
  }

  static async delete(userId: string, id: string) {
    if (getIsConnected()) {
      const deleted = await Goal.findOneAndDelete({ _id: id, userId });
      return !!deleted;
    }
    const len = memoryGoals.length;
    memoryGoals = memoryGoals.filter((g) => !((g._id === id || g.id === id) && g.userId === userId));
    return memoryGoals.length < len;
  }

  static setMemoryGoals(goals: any[]) {
    memoryGoals = [...goals];
  }
}
