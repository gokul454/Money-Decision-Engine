import mongoose from 'mongoose';
import { ENV } from './environment.js';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${ENV.MONGODB_URI} (${error.message}).`);
    console.log('[Database] System will operate with memory-backed state / auto-retry enabled.');
    return false;
  }
}

export function getIsConnected(): boolean {
  return isConnected;
}
