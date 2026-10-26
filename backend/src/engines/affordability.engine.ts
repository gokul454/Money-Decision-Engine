import { SafeToSpendResult } from './safeToSpend.engine.js';

export interface AffordabilityInput {
  itemName: string;
  itemPrice: number;
  category?: string;
  safeToSpendData: SafeToSpendResult;
  currentDate?: Date;
}

export type AffordabilityVerdict = 'SAFE' | 'WAIT' | 'NOT_RECOMMENDED';

export interface AffordabilityImpacts {
  foodBudget: 'Safe' | 'At Risk' | 'Normal';
  savingsGoal: 'On Track' | 'At Risk' | 'Affected';
  weeklyBalance: 'Healthy' | 'Low' | '₹0 (Critical)';
  financialRunway: 'Unchanged' | 'Reduced' | 'Critical';
}

export interface AffordabilityResult {
  itemName: string;
  itemPrice: number;
  verdict: AffordabilityVerdict;
  verdictBadge: string; // "Safe to Buy" | "Wait a Few Days" | "Not Recommended (Yet)"
  safeToSpend: number;
  difference: number;
  afterPurchaseBalance: number;
  primaryReason: string;
  impacts: AffordabilityImpacts;
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

export function evaluateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { itemName, itemPrice, safeToSpendData } = input;
  const now = input.currentDate || new Date();
  const safeToSpendThisWeek = safeToSpendData.safeToSpendThisWeek;
  const remainingDiscretionary = safeToSpendData.remainingDiscretionaryBudget;
  const availableBalance = safeToSpendData.availableBalance;
  const emergencyReserve = safeToSpendData.emergencyReserve;

  const difference = safeToSpendThisWeek - itemPrice;
  const afterPurchaseDiscretionary = remainingDiscretionary - itemPrice;
  const afterPurchaseBalance = availableBalance - itemPrice;

  let verdict: AffordabilityVerdict = 'SAFE';
  let verdictBadge = 'Safe to Buy';
  let primaryReason = 'This purchase is comfortably within your safe-to-spend limit this week.';
  let recommendedWaitDays = 0;

  // Impact evaluation
  let foodBudget: 'Safe' | 'At Risk' | 'Normal' = 'Safe';
  let savingsGoal: 'On Track' | 'At Risk' | 'Affected' = 'On Track';
  let weeklyBalance: 'Healthy' | 'Low' | '₹0 (Critical)' = 'Healthy';
  let financialRunway: 'Unchanged' | 'Reduced' | 'Critical' = 'Unchanged';

  if (itemPrice <= safeToSpendThisWeek && (afterPurchaseBalance >= emergencyReserve)) {
    // 🟢 SAFE
    verdict = 'SAFE';
    verdictBadge = 'Safe to Buy';
    primaryReason = `You have ₹${safeToSpendThisWeek.toLocaleString('en-IN')} safe-to-spend this week. This ₹${itemPrice.toLocaleString('en-IN')} purchase leaves you with ₹${(safeToSpendThisWeek - itemPrice).toLocaleString('en-IN')}.`;
    foodBudget = 'Safe';
    savingsGoal = 'On Track';
    weeklyBalance = 'Healthy';
    financialRunway = 'Unchanged';
    recommendedWaitDays = 0;
  } else if (itemPrice <= remainingDiscretionary && (afterPurchaseBalance >= emergencyReserve * 0.75)) {
    // 🟡 WAIT - affordable over the month, but exceeds current week's safe allowance
    verdict = 'WAIT';
    verdictBadge = 'Wait a Few Days';
    const excess = itemPrice - safeToSpendThisWeek;
    const daysNeeded = Math.ceil(excess / Math.max(1, safeToSpendData.dailySafeSpend));
    recommendedWaitDays = Math.min(safeToSpendData.daysUntilPayday, Math.max(3, daysNeeded));

    primaryReason = `This purchase exceeds your weekly allowance by ₹${excess.toLocaleString('en-IN')}, but is within your monthly budget if you space it out.`;
    foodBudget = 'At Risk';
    savingsGoal = 'At Risk';
    weeklyBalance = 'Low';
    financialRunway = 'Reduced';
  } else {
    // 🔴 NOT RECOMMENDED
    verdict = 'NOT_RECOMMENDED';
    verdictBadge = 'Not Recommended (Yet)';
    primaryReason = 'This purchase will put you over your safe limit this week and compromise your savings goals.';
    
    // Calculate days until next payday or when enough discretionary budget accumulates
    const daysToWait = Math.max(8, safeToSpendData.daysUntilPayday);
    recommendedWaitDays = daysToWait;

    foodBudget = 'At Risk';
    savingsGoal = 'Affected';
    weeklyBalance = '₹0 (Critical)';
    financialRunway = 'Critical';
  }

  // Calculate safe purchase date
  const safeDateObj = new Date(now.getTime() + recommendedWaitDays * 24 * 60 * 60 * 1000);
  const dateFormatted = safeDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    itemName,
    itemPrice,
    verdict,
    verdictBadge,
    safeToSpend: safeToSpendThisWeek,
    difference,
    afterPurchaseBalance,
    primaryReason,
    impacts: {
      foodBudget,
      savingsGoal,
      weeklyBalance,
      financialRunway,
    },
    betterOption: {
      recommendedWaitDays,
      safePurchaseDate: dateFormatted,
      safePurchaseDateIso: safeDateObj.toISOString(),
      actionPrompt: recommendedWaitDays > 0 ? `Wait ${recommendedWaitDays} more days` : 'You can purchase today without financial strain.',
      dailySavingsNeeded: recommendedWaitDays > 0 ? Math.round(itemPrice / recommendedWaitDays) : undefined,
    },
    details: {
      currentBalance: availableBalance,
      remainingDaysToPayday: safeToSpendData.daysUntilPayday,
      emergencyReserveProtected: afterPurchaseBalance >= emergencyReserve,
    },
  };
}
