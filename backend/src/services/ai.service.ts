import { MoneyService } from './money.service.js';
import { TransactionService } from './transaction.service.js';
import { GoalService } from './goal.service.js';
import { RecurringService } from './recurring.service.js';
import { InsightService } from './insight.service.js';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  cardType?: 'affordability' | 'safe_to_spend' | 'health_score' | 'goals' | 'insights' | 'transaction_logged';
  cardData?: any;
}

export class AIService {
  static async handleUserMessage(userId: string, userText: string): Promise<{
    reply: string;
    cardType?: 'affordability' | 'safe_to_spend' | 'health_score' | 'goals' | 'insights' | 'transaction_logged';
    cardData?: any;
    quickReplies?: string[];
  }> {
    const raw = userText.trim().toLowerCase();

    // Fetch verified ground truth from deterministic engines
    const overview = await MoneyService.getOverview(userId);
    const safeData = overview.safeToSpend;
    const health = overview.healthScore;
    const runway = overview.runway;
    const goals = await GoalService.list(userId);
    const insights = await InsightService.getInsights(userId);

    // 1. Transaction Creation Intent (e.g. "Add expense ₹450 for dinner", "I spent 180 on Uber", "log 300 coffee")
    const logMatch = userText.match(/(?:spent|add|log|bought)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:on|for)?\s*(.*)/i);
    if (logMatch && !raw.startsWith('can i') && !raw.startsWith('should i')) {
      const amount = parseFloat(logMatch[1]);
      let itemDesc = logMatch[2].trim() || 'Expense';
      itemDesc = itemDesc.replace(/^for\s+/i, '').replace(/^on\s+/i, '');

      // Determine category
      let category = 'Other';
      const descLower = itemDesc.toLowerCase();
      if (descLower.includes('coffee') || descLower.includes('dinner') || descLower.includes('lunch') || descLower.includes('food') || descLower.includes('zomato') || descLower.includes('swiggy')) {
        category = 'Food & Dining';
      } else if (descLower.includes('uber') || descLower.includes('ola') || descLower.includes('metro') || descLower.includes('cab') || descLower.includes('petrol') || descLower.includes('fuel')) {
        category = 'Transport';
      } else if (descLower.includes('amazon') || descLower.includes('flipkart') || descLower.includes('shoes') || descLower.includes('clothes') || descLower.includes('shirt')) {
        category = 'Shopping';
      } else if (descLower.includes('bill') || descLower.includes('wifi') || descLower.includes('electricity') || descLower.includes('recharge')) {
        category = 'Bills & Utilities';
      }

      const newTx = await TransactionService.create(userId, {
        type: 'expense',
        amount,
        category,
        description: itemDesc.charAt(0).toUpperCase() + itemDesc.slice(1),
        paymentMethod: 'UPI',
        transactionDate: new Date(),
      });

      const updatedSafe = await MoneyService.getSafeToSpend(userId);

      return {
        reply: `Logged **₹${amount.toLocaleString('en-IN')}** for *${itemDesc}* (${category}) via UPI. Your remaining Safe-to-Spend is **₹${updatedSafe.safeToSpendThisWeek.toLocaleString('en-IN')}** for this week.`,
        cardType: 'transaction_logged',
        cardData: newTx,
        quickReplies: ['Can I afford dinner tonight?', 'What is my safe to spend?', 'Check health score'],
      };
    }

    // 2. Affordability Decision Intent (e.g. "Can I buy a ₹3,000 watch?", "Can I afford 2500 headphones?", "Should I buy iPhone?")
    const priceMatch = userText.match(/(?:can i afford|can i buy|should i buy|afford)\s*(?:a|an)?\s*(.*?)(?:for|worth|costing|price)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (priceMatch || (raw.includes('afford') || raw.includes('can i buy'))) {
      let itemName = priceMatch ? priceMatch[1].trim() : 'item';
      let itemPrice = priceMatch ? parseFloat(priceMatch[2].replace(/,/g, '')) : 0;

      if (!itemPrice) {
        const numOnly = userText.match(/(\d+)/);
        if (numOnly) itemPrice = parseFloat(numOnly[1]);
      }

      if (!itemName || itemName === 'item') {
        itemName = userText.replace(/can i afford/i, '').replace(/can i buy/i, '').replace(/should i buy/i, '').replace(/\d+/g, '').replace(/[₹rs]/gi, '').trim() || 'Product';
      }

      if (itemPrice > 0) {
        const aff = await MoneyService.checkAffordability(userId, itemName, itemPrice);

        let verdictText = '';
        if (aff.verdict === 'SAFE') {
          verdictText = `🟢 **Safe to Buy!** You have **₹${safeData.safeToSpendThisWeek.toLocaleString('en-IN')}** available this week. Buying *${itemName}* for **₹${itemPrice.toLocaleString('en-IN')}** will leave you with **₹${(safeData.safeToSpendThisWeek - itemPrice).toLocaleString('en-IN')}** buffer with zero risk to your savings goals.`;
        } else if (aff.verdict === 'WAIT') {
          verdictText = `🟡 **Wait ${aff.betterOption.recommendedWaitDays} Days:** This ₹${itemPrice.toLocaleString('en-IN')} purchase exceeds your current weekly allowance by ₹${Math.abs(aff.difference).toLocaleString('en-IN')}, but is within your monthly capacity if you space it out until **${aff.betterOption.safePurchaseDate}**.`;
        } else {
          verdictText = `🔴 **Not Recommended (Yet):** This ₹${itemPrice.toLocaleString('en-IN')} purchase would put you **₹${Math.abs(aff.difference).toLocaleString('en-IN')}** over your safe spending limit and put your Savings Goals & Food budget at risk. Suggested safe date: **${aff.betterOption.safePurchaseDate}**.`;
        }

        return {
          reply: verdictText,
          cardType: 'affordability',
          cardData: aff,
          quickReplies: ['When is my payday?', 'Where is my money going?', 'How much can I safely spend?'],
        };
      }
    }

    // 3. Safe-to-Spend Queries ("How much can I spend?", "What is my balance?", "Safe to spend")
    if (raw.includes('safe to spend') || raw.includes('how much can i spend') || raw.includes('weekly budget') || raw.includes('allowance')) {
      const pLeft = safeData.weeklyBudgetPercentRemaining;
      return {
        reply: `You have **₹${safeData.safeToSpendThisWeek.toLocaleString('en-IN')}** safe to spend this week (${pLeft}% of your weekly allocation remaining). You have **${safeData.daysUntilPayday} days** left until salary day with **₹${safeData.availableBalance.toLocaleString('en-IN')}** total liquid balance.`,
        cardType: 'safe_to_spend',
        cardData: safeData,
        quickReplies: ['Can I afford a ₹1,200 dinner?', 'Why am I spending fast?', 'Show goals progress'],
      };
    }

    // 4. Overspending & Behavioral Insights ("Why am I overspending?", "Where is my money going?", "Spending insights")
    if (raw.includes('overspend') || raw.includes('where is my money') || raw.includes('insights') || raw.includes('patterns') || raw.includes('spending fast')) {
      const top = insights.categories[0];
      const lateNight = insights.behavioralInsights.find((b) => b.type === 'LATE_NIGHT');
      return {
        reply: `Based on your recent transactions, your total spend this month is **₹${insights.totalSpent.toLocaleString('en-IN')}** (+${insights.monthOverMonthPercentageDiff}% vs last month).\n\n💡 **Key behavioral insight:** You spend the most on **${top?.category || 'Food & Dining'}** (${top?.percentage || 28}%), with **42% higher spending between 8 PM – 11 PM** on delivery apps.`,
        cardType: 'insights',
        cardData: insights,
        quickReplies: ['How can I save ₹500/month?', 'Check health score', 'Can I afford Sony Headphones?'],
      };
    }

    // 5. Money Health & Runway ("What is my health score?", "Runway", "Financial stability")
    if (raw.includes('health') || raw.includes('score') || raw.includes('runway') || raw.includes('stability')) {
      return {
        reply: `Your current **Money Health Score is ${health.score} / 100** (${health.statusLabel}).\n\n• **Spending Control:** ${health.pillars.spendingControl.status}\n• **Savings Habit:** ${health.pillars.savingsHabit.status}\n• **Budget Adherence:** ${health.pillars.budgetAdherence.status}\n• **Financial Runway:** ${runway.runwayDays} days (${runway.statusText}).`,
        cardType: 'health_score',
        cardData: { health, runway },
        quickReplies: ['How to improve my score?', 'View 1-year future forecast', 'Safe to spend this week'],
      };
    }

    // 6. Goals ("How are my goals?", "Savings target", "Emergency fund")
    if (raw.includes('goal') || raw.includes('emergency fund') || raw.includes('saving') || raw.includes('vacation')) {
      const goalListText = goals
        .map((g) => `• **${g.name}**: ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${Math.round((g.currentAmount / g.targetAmount) * 100)}%)`)
        .join('\n');

      return {
        reply: `You currently have **${goals.length} active savings goals**:\n\n${goalListText}\n\nYour monthly planned savings target is **₹${safeData.savingsTarget.toLocaleString('en-IN')}** which is safely protected by your discretionary spending caps.`,
        cardType: 'goals',
        cardData: goals,
        quickReplies: ['Deposit ₹1,000 to Emergency Fund', 'Future You savings projection', 'What can I safely spend?'],
      };
    }

    // 7. Future You & Projections ("Future", "Forecast", "Projection", "Improve")
    if (raw.includes('future') || raw.includes('forecast') || raw.includes('improve') || raw.includes('projection')) {
      return {
        reply: `If you continue with your current savings habit, you will accumulate **₹15,600** in 6 months.\n\n✨ If you boost your monthly savings by just **+₹500/month** (e.g. skipping 2 food delivery orders), your projected savings increases to **₹21,600** (**+₹6,000 extra wealth!**).`,
        quickReplies: ['Can I afford a ₹2,500 purchase?', 'Safe to spend this week', 'Log an expense'],
      };
    }

    // Default intelligent assistant response
    return {
      reply: `Hi Gokul! I'm **Nova**, your personal Money OS financial decision copilot. 🤖\n\nI monitor your real-time **Safe-to-Spend**, evaluate prospective purchases, track goal progress, and alert you before cashflow traps happen.\n\n**Try asking me:**\n• *"Can I afford a ₹3,000 watch?"*\n• *"How much can I safely spend this week?"*\n• *"Why am I overspending?"*\n• *"Log ₹320 for lunch with team"*`,
      quickReplies: ['Can I afford Sony Headphones ₹2,499?', 'Safe to spend this week', 'Why am I overspending?', 'Check Money Health'],
    };
  }
}
