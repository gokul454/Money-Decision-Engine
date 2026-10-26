import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  OverviewData,
  TransactionItem,
  GoalItem,
  RecurringItem,
  SpendingInsightsData,
} from '../types/index.js';
import { api } from '../api/client.js';
import { getPendingTransactions } from '../utils/db.js';
import { useAuth } from './AuthContext.js';

interface MoneyContextType {
  overview: OverviewData | null;
  transactions: TransactionItem[];
  goals: GoalItem[];
  recurring: RecurringItem[];
  insights: SpendingInsightsData | null;
  loading: boolean;
  isOffline: boolean;
  pendingSyncCount: number;
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  isNotifOpen: boolean;
  toggleNotif: () => void;
  refreshAll: () => Promise<void>;
  addTransaction: (tx: Partial<TransactionItem>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Partial<GoalItem>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<GoalItem>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const defaultOverview: OverviewData = {
  safeToSpend: {
    monthlyIncome: 15000,
    fixedExpenses: 5000,
    savingsTarget: 2000,
    emergencyReserve: 2000,
    discretionaryBudget: 6000,
    actualSpentThisMonth: 8580,
    remainingDiscretionaryBudget: 1240,
    daysUntilPayday: 12,
    remainingWeeks: 2,
    weeklyAllowance: 1500,
    safeToSpendThisWeek: 1240,
    spentThisWeek: 480,
    weeklyBudgetPercentRemaining: 72,
    weeklyBudgetPercentUsed: 28,
    dailySafeSpend: 103,
    availableBalance: 8420,
    spendingVelocity: {
      burnRateDaily: 286,
      expectedDailyBudget: 200,
      velocityRatio: 1.43,
      status: 'CRITICAL',
      warningMessage: "Spending faster than usual. You've used 72% of your weekly spending budget.",
    },
  },
  healthScore: {
    score: 78,
    statusLabel: "You're doing good!",
    trend: [71, 73, 74, 72, 75, 77, 78],
    deltaText: '+3 vs last month',
    pillars: {
      spendingControl: { name: 'Spending Control', score: 85, status: 'Good', description: 'Good spending pacing' },
      savingsHabit: { name: 'Savings Habit', score: 88, status: 'Good', description: 'On track with monthly goals' },
      budgetAdherence: { name: 'Budget Adherence', score: 70, status: 'Average', description: 'Close to weekly allowance' },
      financialStability: { name: 'Financial Stability', score: 90, status: 'Good', description: 'Emergency reserve funded' },
    },
    summaryRecommendations: ['Discretionary spending is trending high this week.'],
  },
  runway: {
    runwayDays: 45,
    runwayMonths: 1.5,
    dailyBurnRate: 187,
    monthlyBurnRate: 5600,
    status: 'MODERATE',
    statusText: '1.5 months liquid buffer',
    reserveOnlyDays: 14,
  },
  monthOverview: {
    income: 15000,
    expenses: 8580,
    netCashFlow: 6420,
  },
  topCategories: [
    { category: 'Food & Dining', amount: 2340, percentage: 28 },
    { category: 'Shopping', amount: 1850, percentage: 22 },
    { category: 'Transport', amount: 1120, percentage: 13 },
    { category: 'Entertainment', amount: 850, percentage: 10 },
  ],
  user: {
    id: '64b8f0f1c2a4d5e6f7a8b9c0',
    name: 'Gokul',
    email: 'gokul@moneyos.local',
    currency: 'INR',
    levelTitle: 'Level 2 Money Smart',
  },
};

const MoneyContext = createContext<MoneyContextType | undefined>(undefined);

export const MoneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(defaultOverview);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);
  const [insights, setInsights] = useState<SpendingInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const checkPending = async () => {
    try {
      const items = await getPendingTransactions();
      setPendingSyncCount(items.length);
    } catch (e) {
      // ignore
    }
  };

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        await api.syncOfflineQueue();
      }
      await checkPending();

      const [ovData, txData, goalsData, recData, insData] = await Promise.allSettled([
        api.getOverview(),
        api.getTransactions(),
        api.getGoals(),
        api.getRecurring(),
        api.getInsights(),
      ]);

      if (ovData.status === 'fulfilled' && ovData.value) setOverview(ovData.value);
      if (txData.status === 'fulfilled' && txData.value) setTransactions(txData.value);
      if (goalsData.status === 'fulfilled' && goalsData.value) setGoals(goalsData.value);
      if (recData.status === 'fulfilled' && recData.value) setRecurring(recData.value);
      if (insData.status === 'fulfilled' && insData.value) setInsights(insData.value);
    } catch (err) {
      console.warn('Refresh data failed, maintaining cached state', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const handleOnline = () => {
      setIsOffline(false);
      api.syncOfflineQueue().then(refreshAll);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, refreshAll]);

  const addTransaction = async (tx: Partial<TransactionItem>) => {
    await api.createTransaction(tx);
    await refreshAll();
  };

  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    await refreshAll();
  };

  const addGoal = async (g: Partial<GoalItem>) => {
    await api.createGoal(g);
    await refreshAll();
  };

  const updateGoal = async (id: string, g: Partial<GoalItem>) => {
    await api.updateGoal(id, g);
    await refreshAll();
  };

  const deleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    await refreshAll();
  };

  const resetDemo = async () => {
    await api.resetDemoData();
    await refreshAll();
  };

  return (
    <MoneyContext.Provider
      value={{
        overview,
        transactions,
        goals,
        recurring,
        insights,
        loading,
        isOffline,
        pendingSyncCount,
        isAddModalOpen,
        openAddModal: () => setIsAddModalOpen(true),
        closeAddModal: () => setIsAddModalOpen(false),
        isNotifOpen,
        toggleNotif: () => setIsNotifOpen((prev) => !prev),
        refreshAll,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        resetDemo,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
};

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) throw new Error('useMoney must be used within a MoneyProvider');
  return context;
}
