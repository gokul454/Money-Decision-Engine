export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  levelTitle?: string;
  avatarUrl?: string;
}

export interface FinancialProfile {
  userId: string;
  monthlyIncome: number;
  payday: number;
  fixedExpenses: number;
  savingsTarget: number;
  emergencyReserve: number;
  currentLiquidBalance: number;
}

export interface SafeToSpendData {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  emergencyReserve: number;
  discretionaryBudget: number;
  actualSpentThisMonth: number;
  remainingDiscretionaryBudget: number;
  daysUntilPayday: number;
  remainingWeeks: number;
  weeklyAllowance: number;
  safeToSpendThisWeek: number;
  spentThisWeek: number;
  weeklyBudgetPercentRemaining: number;
  weeklyBudgetPercentUsed: number;
  dailySafeSpend: number;
  availableBalance: number;
  spendingVelocity: {
    burnRateDaily: number;
    expectedDailyBudget: number;
    velocityRatio: number;
    status: 'NORMAL' | 'FAST' | 'CRITICAL';
    warningMessage?: string;
  };
}

export interface HealthScorePillar {
  name: string;
  score: number;
  status: 'Good' | 'Average' | 'Needs Improvement';
  description: string;
}

export interface HealthScoreData {
  score: number;
  statusLabel: string;
  trend: number[];
  deltaText: string;
  pillars: {
    spendingControl: HealthScorePillar;
    savingsHabit: HealthScorePillar;
    budgetAdherence: HealthScorePillar;
    financialStability: HealthScorePillar;
  };
  summaryRecommendations: string[];
}

export interface RunwayData {
  runwayDays: number;
  runwayMonths: number;
  dailyBurnRate: number;
  monthlyBurnRate: number;
  status: 'HEALTHY' | 'MODERATE' | 'CRITICAL';
  statusText: string;
  reserveOnlyDays: number;
}

export interface OverviewData {
  safeToSpend: SafeToSpendData;
  healthScore: HealthScoreData;
  runway: RunwayData;
  monthOverview: {
    income: number;
    expenses: number;
    netCashFlow: number;
  };
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  user: UserProfile;
}

export interface TransactionItem {
  _id: string;
  id?: string;
  userId: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  category: string;
  description: string;
  merchant?: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  transactionDate: string;
  notes?: string;
  isImpulse?: boolean;
  timeOfDay?: string;
  synced?: boolean;
}

export interface GoalItem {
  _id: string;
  id?: string;
  userId: string;
  name: string;
  categoryIcon?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  status: 'active' | 'completed' | 'paused';
  priority: number;
}

export interface RecurringItem {
  _id: string;
  id?: string;
  userId: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDueDate: string;
  category: string;
  icon?: string;
  isAutoPaid?: boolean;
}

export interface AffordabilityResult {
  itemName: string;
  itemPrice: number;
  verdict: 'SAFE' | 'WAIT' | 'NOT_RECOMMENDED';
  verdictBadge: string;
  safeToSpend: number;
  difference: number;
  afterPurchaseBalance: number;
  primaryReason: string;
  impacts: {
    foodBudget: 'Safe' | 'At Risk' | 'Normal';
    savingsGoal: 'On Track' | 'At Risk' | 'Affected';
    weeklyBalance: 'Healthy' | 'Low' | '₹0 (Critical)';
    financialRunway: 'Unchanged' | 'Reduced' | 'Critical';
  };
  betterOption: {
    recommendedWaitDays: number;
    safePurchaseDate: string;
    safePurchaseDateIso: string;
    actionPrompt: string;
    dailySavingsNeeded?: number;
  };
  details: {
    currentBalance: number;
    remainingDaysToPayday: number;
    emergencyReserveProtected: boolean;
  };
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  transactionCount: number;
}

export interface BehavioralInsight {
  id: string;
  type: 'LATE_NIGHT' | 'IMPULSE' | 'VELOCITY' | 'RECURRING';
  title: string;
  icon: string;
  description: string;
  metric?: string;
  severity: 'info' | 'warning' | 'positive';
}

export interface SpendingInsightsData {
  period: 'this_month' | 'last_month';
  totalSpent: number;
  lastMonthTotalSpent: number;
  monthOverMonthPercentageDiff: number;
  isSpendingHigher: boolean;
  categories: CategorySpending[];
  behavioralInsights: BehavioralInsight[];
  primaryHighlight: {
    title: string;
    text: string;
  };
}

export interface ForecastPoint {
  period: string;
  baselineSavings: number;
  improvedSavings: number;
}

export interface HorizonForecast {
  horizon: '30days' | '6months' | '1year' | '5years';
  label: string;
  baselineTotal: number;
  improvedTotal: number;
  potentialImprovement: number;
  monthlyBoostAmount: number;
  chartData: ForecastPoint[];
  actionableTip: string;
}
