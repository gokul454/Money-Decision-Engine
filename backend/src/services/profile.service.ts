import { FinancialProfile, IFinancialProfile } from '../models/FinancialProfile.js';
import { User } from '../models/User.js';
import { getIsConnected } from '../config/database.js';

const memoryProfiles = new Map<string, any>();

export class ProfileService {
  static async getProfile(userId: string) {
    if (getIsConnected()) {
      let profile = await FinancialProfile.findOne({ userId });
      if (!profile) {
        profile = await FinancialProfile.create({
          userId,
          monthlyIncome: 15000,
          payday: 1,
          fixedExpenses: 5000,
          savingsTarget: 2000,
          emergencyReserve: 2000,
          currentLiquidBalance: 8420,
        });
      }
      const user = await User.findById(userId);
      return {
        user: {
          id: user?._id?.toString() || userId,
          name: user?.name || 'Gokul',
          email: user?.email || 'gokul@moneyos.local',
          currency: user?.currency || 'INR',
          levelTitle: user?.levelTitle || 'Level 2 Money Smart',
          avatarUrl: user?.avatarUrl,
        },
        financial: profile,
      };
    }

    let p = memoryProfiles.get(userId);
    if (!p) {
      p = {
        userId,
        monthlyIncome: 15000,
        payday: 1,
        fixedExpenses: 5000,
        savingsTarget: 2000,
        emergencyReserve: 2000,
        currentLiquidBalance: 8420,
      };
      memoryProfiles.set(userId, p);
    }

    return {
      user: {
        id: userId,
        name: 'Gokul',
        email: 'gokul@moneyos.local',
        currency: 'INR',
        levelTitle: 'Level 2 Money Smart',
      },
      financial: p,
    };
  }

  static async updateProfile(userId: string, data: Partial<IFinancialProfile> & { name?: string; currency?: string }) {
    if (getIsConnected()) {
      if (data.name || data.currency) {
        await User.findByIdAndUpdate(userId, {
          ...(data.name && { name: data.name }),
          ...(data.currency && { currency: data.currency }),
        });
      }

      const updated = await FinancialProfile.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, upsert: true }
      );
      return updated;
    }

    const current = memoryProfiles.get(userId) || {
      userId,
      monthlyIncome: 15000,
      payday: 1,
      fixedExpenses: 5000,
      savingsTarget: 2000,
      emergencyReserve: 2000,
      currentLiquidBalance: 8420,
    };

    const merged = { ...current, ...data };
    memoryProfiles.set(userId, merged);
    return merged;
  }

  static seedInMemoryProfile(userId: string, profile: any) {
    memoryProfiles.set(userId, profile);
  }
}
