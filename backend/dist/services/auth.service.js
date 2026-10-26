"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const FinancialProfile_js_1 = require("../models/FinancialProfile.js");
const environment_js_1 = require("../config/environment.js");
const database_js_1 = require("../config/database.js");
// In-memory fallback cache
const memoryUsers = new Map();
class AuthService {
    static async register(data) {
        const existing = await this.findByEmail(data.email);
        if (existing) {
            throw new Error('An account with this email already exists.');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        const currency = data.currency || 'INR';
        let user;
        if ((0, database_js_1.getIsConnected)()) {
            user = await User_js_1.User.create({
                name: data.name,
                email: data.email.toLowerCase(),
                passwordHash,
                currency,
                levelTitle: 'Level 2 Money Smart',
            });
            // Default financial profile
            await FinancialProfile_js_1.FinancialProfile.create({
                userId: user._id,
                monthlyIncome: 15000,
                payday: 1,
                fixedExpenses: 5000,
                savingsTarget: 2000,
                emergencyReserve: 2000,
                currentLiquidBalance: 8420,
            });
        }
        else {
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
        const token = jsonwebtoken_1.default.sign({ userId: user._id?.toString() || user.id, email: user.email }, environment_js_1.ENV.JWT_SECRET, {
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
    static async login(data) {
        const user = await this.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        const isMatch = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }
        const userIdStr = user._id ? user._id.toString() : user.id;
        const token = jsonwebtoken_1.default.sign({ userId: userIdStr, email: user.email }, environment_js_1.ENV.JWT_SECRET, {
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
    static async findByEmail(email) {
        const normalized = email.toLowerCase().trim();
        if ((0, database_js_1.getIsConnected)()) {
            return await User_js_1.User.findOne({ email: normalized });
        }
        return memoryUsers.get(normalized) || null;
    }
    static async findById(id) {
        if ((0, database_js_1.getIsConnected)()) {
            return await User_js_1.User.findById(id);
        }
        for (const u of memoryUsers.values()) {
            if (u.id === id || u._id === id)
                return u;
        }
        return null;
    }
    static seedInMemoryUser(user) {
        memoryUsers.set(user.email.toLowerCase(), user);
    }
}
exports.AuthService = AuthService;
