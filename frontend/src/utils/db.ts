import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { TransactionItem } from '../types/index.js';

interface MoneyOSDB extends DBSchema {
  pendingTransactions: {
    key: string;
    value: TransactionItem & { pendingSync: boolean; localId: string };
  };
  offlineCache: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<MoneyOSDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MoneyOSDB>('money_os_pwa_db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pendingTransactions')) {
          db.createObjectStore('pendingTransactions', { keyPath: 'localId' });
        }
        if (!db.objectStoreNames.contains('offlineCache')) {
          db.createObjectStore('offlineCache');
        }
      },
    });
  }
  return dbPromise;
}

export async function savePendingTransaction(tx: any) {
  const db = await getDB();
  const localId = 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const record = {
    ...tx,
    localId,
    _id: localId,
    pendingSync: true,
  };
  await db.put('pendingTransactions', record);
  return record;
}

export async function getPendingTransactions() {
  const db = await getDB();
  return await db.getAll('pendingTransactions');
}

export async function removePendingTransaction(localId: string) {
  const db = await getDB();
  await db.delete('pendingTransactions', localId);
}

export async function cacheApiResponse(key: string, data: any) {
  try {
    const db = await getDB();
    await db.put('offlineCache', data, key);
  } catch (e) {
    console.warn('Cache write failed', e);
  }
}

export async function getCachedApiResponse(key: string) {
  try {
    const db = await getDB();
    return await db.get('offlineCache', key);
  } catch (e) {
    return null;
  }
}
