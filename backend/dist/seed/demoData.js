"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoData = seedDemoData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = require("../models/User.js");
const FinancialProfile_js_1 = require("../models/FinancialProfile.js");
const Transaction_js_1 = require("../models/Transaction.js");
const Goal_js_1 = require("../models/Goal.js");
const RecurringExpense_js_1 = require("../models/RecurringExpense.js");
const auth_service_js_1 = require("../services/auth.service.js");
const profile_service_js_1 = require("../services/profile.service.js");
const transaction_service_js_1 = require("../services/transaction.service.js");
const goal_service_js_1 = require("../services/goal.service.js");
const recurring_service_js_1 = require("../services/recurring.service.js");
const database_js_1 = require("../config/database.js");
async function seedDemoData() {
    console.log('[Seed] Seeding realistic Money OS demo data for Gokul...');
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash('password123', salt);
    const demoUserId = new mongoose_1.default.Types.ObjectId('64b8f0f1c2a4d5e6f7a8b9c0');
    const demoUserIdStr = demoUserId.toString();
    const userDoc = {
        _id: demoUserId,
        id: demoUserIdStr,
        name: 'Gokul',
        email: 'gokul@moneyos.local',
        passwordHash,
        currency: 'INR',
        levelTitle: 'Level 2 Money Smart',
    };
    const profileDoc = {
        userId: demoUserId,
        monthlyIncome: 15000,
        payday: 1,
        fixedExpenses: 5000,
        savingsTarget: 2000,
        emergencyReserve: 2000,
        currentLiquidBalance: 8420,
    };
    const now = new Date();
    const today = new Date(now);
    const yesterday = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 86400000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
    const transactionsData = [
        // Today
        {
            userId: demoUserId,
            type: 'expense',
            amount: 260,
            category: 'Food & Dining',
            description: 'Zomato',
            merchant: 'Zomato',
            paymentMethod: 'UPI',
            transactionDate: today,
            timeOfDay: '13:30',
            notes: 'Lunch biryani bowl',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 180,
            category: 'Transport',
            description: 'Uber',
            merchant: 'Uber',
            paymentMethod: 'UPI',
            transactionDate: today,
            timeOfDay: '08:45',
            notes: 'Office ride',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 240,
            category: 'Food & Dining',
            description: 'Starbucks',
            merchant: 'Starbucks',
            paymentMethod: 'UPI',
            transactionDate: today,
            timeOfDay: '08:20',
            notes: 'Morning Hazelnut latte',
        },
        // Yesterday
        {
            userId: demoUserId,
            type: 'expense',
            amount: 450,
            category: 'Shopping',
            description: 'Amazon',
            merchant: 'Amazon',
            paymentMethod: 'UPI',
            transactionDate: yesterday,
            timeOfDay: '16:15',
            notes: 'Desk cable organizer',
            isImpulse: true,
        },
        // 20 Aug / 2 days ago
        {
            userId: demoUserId,
            type: 'expense',
            amount: 320,
            category: 'Food & Dining',
            description: 'Swiggy',
            merchant: 'Swiggy',
            paymentMethod: 'UPI',
            transactionDate: twoDaysAgo,
            timeOfDay: '22:15',
            notes: 'Late-night cravings',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 930,
            category: 'Shopping',
            description: 'Flipkart',
            merchant: 'Flipkart',
            paymentMethod: 'UPI',
            transactionDate: twoDaysAgo,
            timeOfDay: '19:40',
            notes: 'T-shirt & socks order',
            isImpulse: true,
        },
        // Earlier this month to match ₹8,580 total
        {
            userId: demoUserId,
            type: 'expense',
            amount: 1520,
            category: 'Food & Dining',
            description: 'Weekend Team Dinner',
            merchant: 'Socials',
            paymentMethod: 'Card',
            transactionDate: fourDaysAgo,
            timeOfDay: '21:00',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 940,
            category: 'Transport',
            description: 'Metro & Fuel',
            merchant: 'Metro card topup',
            paymentMethod: 'UPI',
            transactionDate: fourDaysAgo,
            timeOfDay: '11:00',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 850,
            category: 'Entertainment',
            description: 'Movie IMAX & Popcorn',
            merchant: 'PVR Cinemas',
            paymentMethod: 'UPI',
            transactionDate: tenDaysAgo,
            timeOfDay: '19:00',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 720,
            category: 'Bills & Utilities',
            description: 'Electricity bill',
            merchant: 'Electricity Board',
            paymentMethod: 'UPI',
            transactionDate: tenDaysAgo,
            timeOfDay: '10:00',
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 470,
            category: 'Shopping',
            description: 'Myntra Accessories',
            merchant: 'Myntra',
            paymentMethod: 'UPI',
            transactionDate: tenDaysAgo,
            timeOfDay: '15:30',
            isImpulse: true,
        },
        {
            userId: demoUserId,
            type: 'expense',
            amount: 1700,
            category: 'Others',
            description: 'Gift & pharmacy essentials',
            merchant: 'Apollo Pharmacy',
            paymentMethod: 'UPI',
            transactionDate: tenDaysAgo,
            timeOfDay: '14:00',
        },
    ];
    const goalsData = [
        {
            userId: demoUserId,
            name: 'Emergency Fund',
            categoryIcon: 'Shield',
            targetAmount: 50000,
            currentAmount: 18500,
            targetDate: new Date('2026-12-31'),
            monthlyContribution: 2000,
            status: 'active',
            priority: 1,
        },
        {
            userId: demoUserId,
            name: 'New Phone',
            categoryIcon: 'Smartphone',
            targetAmount: 35000,
            currentAmount: 9200,
            targetDate: new Date('2026-11-30'),
            monthlyContribution: 3000,
            status: 'active',
            priority: 2,
        },
        {
            userId: demoUserId,
            name: 'Europe Trip',
            categoryIcon: 'Plane',
            targetAmount: 75000,
            currentAmount: 15800,
            targetDate: new Date('2027-06-30'),
            monthlyContribution: 4000,
            status: 'active',
            priority: 3,
        },
    ];
    const recurringData = [
        {
            userId: demoUserId,
            name: 'Internet',
            amount: 699,
            frequency: 'monthly',
            nextDueDate: new Date(now.getTime() + 2 * 86400000), // Due in 2 days
            category: 'Bills & Utilities',
            icon: 'Wifi',
        },
        {
            userId: demoUserId,
            name: 'Netflix',
            amount: 649,
            frequency: 'monthly',
            nextDueDate: new Date(now.getTime() + 7 * 86400000), // Due in 7 days
            category: 'Entertainment',
            icon: 'Tv',
        },
        {
            userId: demoUserId,
            name: 'House Rent',
            amount: 3500,
            frequency: 'monthly',
            nextDueDate: new Date(now.getTime() + 12 * 86400000), // Due next month
            category: 'Housing',
            icon: 'Home',
        },
    ];
    // Seed memory caches always
    auth_service_js_1.AuthService.seedInMemoryUser(userDoc);
    profile_service_js_1.ProfileService.seedInMemoryProfile(demoUserIdStr, profileDoc);
    transaction_service_js_1.TransactionService.setMemoryTransactions(transactionsData.map((t, idx) => ({ ...t, _id: 'tx_seed_' + idx, id: 'tx_seed_' + idx })));
    goal_service_js_1.GoalService.setMemoryGoals(goalsData.map((g, idx) => ({ ...g, _id: 'goal_seed_' + idx, id: 'goal_seed_' + idx })));
    recurring_service_js_1.RecurringService.setMemoryRecurring(recurringData.map((r, idx) => ({ ...r, _id: 'rec_seed_' + idx, id: 'rec_seed_' + idx })));
    // If MongoDB is connected, also seed Mongoose database
    if ((0, database_js_1.getIsConnected)()) {
        try {
            await User_js_1.User.findOneAndUpdate({ email: userDoc.email }, userDoc, { upsert: true });
            await FinancialProfile_js_1.FinancialProfile.findOneAndUpdate({ userId: demoUserId }, profileDoc, { upsert: true });
            const txCount = await Transaction_js_1.Transaction.countDocuments({ userId: demoUserId });
            if (txCount === 0) {
                await Transaction_js_1.Transaction.insertMany(transactionsData);
            }
            const goalCount = await Goal_js_1.Goal.countDocuments({ userId: demoUserId });
            if (goalCount === 0) {
                await Goal_js_1.Goal.insertMany(goalsData);
            }
            const recCount = await RecurringExpense_js_1.RecurringExpense.countDocuments({ userId: demoUserId });
            if (recCount === 0) {
                await RecurringExpense_js_1.RecurringExpense.insertMany(recurringData);
            }
            console.log('[Seed] MongoDB collections populated successfully.');
        }
        catch (err) {
            console.warn('[Seed] Notice while syncing to MongoDB:', err.message);
        }
    }
    console.log('[Seed] Demo data ready: gokul@moneyos.local / password123');
}
