import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { FinancialProfile } from '../models/FinancialProfile.js';
import { ENV } from '../config/environment.js';
import { getIsConnected } from '../config/database.js';

// In-memory fallback cache
const memoryUsers = new Map<string, any>();

export class AuthService {
  static async register(data: { name: string; email: string; password: string; currency?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const currency = data.currency || 'INR';

    let user: any;
    if (getIsConnected()) {
      user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        currency,
        levelTitle: 'Level 2 Money Smart',
      });

      // Default financial profile
      await FinancialProfile.create({
        userId: user._id,
        monthlyIncome: 15000,
        payday: 1,
        fixedExpenses: 5000,
        savingsTarget: 2000,
        emergencyReserve: 2000,
        currentLiquidBalance: 8420,
      });
    } else {
      const id = 'user_' + Date.now();
      user = {
        _id: id,
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        currency,
        levelTitle: 'Level 2 Money Smart',
        createdAt: new Date(),
      };
      memoryUsers.set(data.email.toLowerCase(), user);
    }

    const token = jwt.sign({ userId: user._id?.toString() || user.id, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: '30d',
    });

    return {
      token,
      user: {
        id: user._id?.toString() || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        levelTitle: user.levelTitle,
      },
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await this.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const userIdStr = user._id ? user._id.toString() : user.id;
    const token = jwt.sign({ userId: userIdStr, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: '30d',
    });

    return {
      token,
      user: {
        id: userIdStr,
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
        levelTitle: user.levelTitle || 'Level 2 Money Smart',
      },
    };
  }

  static async findByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    if (getIsConnected()) {
      return await User.findOne({ email: normalized });
    }
    return memoryUsers.get(normalized) || null;
  }

  static async findById(id: string) {
    if (getIsConnected()) {
      return await User.findById(id);
    }
    for (const u of memoryUsers.values()) {
      if (u.id === id || u._id === id) return u;
    }
    return null;
  }

  static seedInMemoryUser(user: any) {
    memoryUsers.set(user.email.toLowerCase(), user);
  }
}
