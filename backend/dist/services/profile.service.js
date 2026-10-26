"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const FinancialProfile_js_1 = require("../models/FinancialProfile.js");
const User_js_1 = require("../models/User.js");
const database_js_1 = require("../config/database.js");
const memoryProfiles = new Map();
class ProfileService {
    static async getProfile(userId) {
        if ((0, database_js_1.getIsConnected)()) {
            let profile = await FinancialProfile_js_1.FinancialProfile.findOne({ userId });
            if (!profile) {
                profile = await FinancialProfile_js_1.FinancialProfile.create({
                    userId,
                    monthlyIncome: 15000,
                    payday: 1,
                    fixedExpenses: 5000,
                    savingsTarget: 2000,
                    emergencyReserve: 2000,
                    currentLiquidBalance: 8420,
                });
            }
            const user = await User_js_1.User.findById(userId);
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
    static async updateProfile(userId, data) {
        if ((0, database_js_1.getIsConnected)()) {
            if (data.name || data.currency) {
                await User_js_1.User.findByIdAndUpdate(userId, {
                    ...(data.name && { name: data.name }),
                    ...(data.currency && { currency: data.currency }),
                });
            }
            const updated = await FinancialProfile_js_1.FinancialProfile.findOneAndUpdate({ userId }, { $set: data }, { new: true, upsert: true });
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
    static seedInMemoryProfile(userId, profile) {
        memoryProfiles.set(userId, profile);
    }
}
exports.ProfileService = ProfileService;
