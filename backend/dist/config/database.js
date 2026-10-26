"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getIsConnected = getIsConnected;
const mongoose_1 = __importDefault(require("mongoose"));
const environment_js_1 = require("./environment.js");
let isConnected = false;
async function connectDB() {
    if (isConnected)
        return true;
    try {
        mongoose_1.default.set('strictQuery', false);
        const conn = await mongoose_1.default.connect(environment_js_1.ENV.MONGODB_URI, {
            serverSelectionTimeoutMS: 3000,
        });
        isConnected = true;
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return true;
    }
    catch (error) {
        console.warn(`[Database] Warning: Could not connect to MongoDB at ${environment_js_1.ENV.MONGODB_URI} (${error.message}).`);
        console.log('[Database] System will operate with memory-backed state / auto-retry enabled.');
        return false;
    }
}
function getIsConnected() {
    return isConnected;
}
