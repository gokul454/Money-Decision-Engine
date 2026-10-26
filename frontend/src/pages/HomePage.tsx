import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUpRight, ShieldCheck, Utensils, ShoppingBag, Car, ChevronRight, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';
import { useAuth } from '../context/AuthContext.js';
import { ArcGauge } from '../components/ArcGauge.js';
import { HealthSparkline } from '../components/HealthSparkline.js';

export const HomePage: React.FC = () => {
  const { overview, toggleNotif } = useMoney();
  const { user } = useAuth();
  const navigate = useNavigate();

  const safeData = overview?.safeToSpend || {
    safeToSpendThisWeek: 1240,
    weeklyBudgetPercentRemaining: 72,
    daysUntilPayday: 12,
    availableBalance: 8420,
    spendingVelocity: {
      status: 'CRITICAL',
      warningMessage: "You've used 72% of your weekly spending budget.",
    },
  };

  const healthData = overview?.healthScore || {
    score: 78,
    statusLabel: "You're doing good!",
    trend: [71, 73, 74, 72, 75, 77, 78],
  };

  const monthOverview = overview?.monthOverview || {
    income: 15000,
    expenses: 8580,
  };

  const topCategories = overview?.topCategories || [
    { category: 'Food & Dining', amount: 2340, percentage: 28 },
    { category: 'Shopping', amount: 1850, percentage: 22 },
    { category: 'Transport', amount: 1120, percentage: 13 },
  ];

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Food')) return <Utensils className="w-4 h-4 text-rose-400" />;
    if (cat.includes('Shopping')) return <ShoppingBag className="w-4 h-4 text-purple-400" />;
    if (cat.includes('Transport')) return <Car className="w-4 h-4 text-sky-400" />;
    return <Sparkles className="w-4 h-4 text-slate-400" />;
  };

  const getCategoryBg = (cat: string) => {
    if (cat.includes('Food')) return 'bg-rose-500/20 border-rose-500/30';
    if (cat.includes('Shopping')) return 'bg-purple-500/20 border-purple-500/30';
    if (cat.includes('Transport')) return 'bg-sky-500/20 border-sky-500/30';
    return 'bg-slate-500/20 border-slate-500/30';
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-1.5">
            Good morning, {user?.name || 'Gokul'} <span className="text-lg">👋</span>
          </h1>
          <p className="text-xs text-slate-400">Here's your money overview</p>
        </div>
        <button
          onClick={toggleNotif}
          className="relative w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>
      </div>

      {/* Main Safe to Spend Card */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#111728]/90 to-[#0c101c]/90">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Arc Gauge */}
          <div className="relative">
            <ArcGauge
              percentRemaining={safeData.weeklyBudgetPercentRemaining}
              safeAmount={safeData.safeToSpendThisWeek}
              size={170}
            />
          </div>

          {/* Side Info */}
          <div className="flex-1 w-full sm:w-auto flex flex-col justify-center space-y-3 sm:border-l sm:border-white/10 sm:pl-4">
            <div>
              <div className="text-2xl font-extrabold text-white">
                {safeData.weeklyBudgetPercentRemaining}%
              </div>
              <div className="text-xs text-slate-400 font-medium">of weekly budget left</div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-base font-bold text-white">
                  {safeData.daysUntilPayday} days
                </div>
                <div className="text-[10px] text-slate-400">until next salary</div>
              </div>
              <div>
                <div className="text-base font-bold text-white">
                  ₹{safeData.availableBalance.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">available balance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Money Health Card */}
      <div
        onClick={() => navigate('/profile')}
        className="glass-card glass-card-hover cursor-pointer rounded-2xl p-4 flex items-center justify-between border border-white/10 bg-[#0f1526]/80"
      >
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Money Health
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{healthData.score}</span>
            <span className="text-xs text-slate-400 font-medium">/100</span>
          </div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {healthData.statusLabel}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <HealthSparkline data={healthData.trend} width={105} height={32} />
          <span className="text-[10px] text-emerald-400/90 font-mono mt-1">+3 pts</span>
        </div>
      </div>

      {/* This Month Overview Card */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            This Month Overview
          </h2>
          <button
            onClick={() => navigate('/insights')}
            className="text-xs text-indigo-400 font-medium flex items-center hover:text-indigo-300"
          >
            See all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Income</div>
            <div className="text-lg font-extrabold text-emerald-400">
              ₹{monthOverview.income.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Expenses</div>
            <div className="text-lg font-extrabold text-rose-400">
              ₹{monthOverview.expenses.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending Categories Card */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Top Spending Categories
          </h2>
          <button
            onClick={() => navigate('/insights')}
            className="text-xs text-indigo-400 font-medium hover:underline"
          >
            Insights
          </button>
        </div>

        <div className="space-y-2.5">
          {topCategories.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${getCategoryBg(cat.category)}`}>
                  {getCategoryIcon(cat.category)}
                </div>
                <span className="text-xs font-semibold text-white">{cat.category}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">{cat.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Decision Engine CTA Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Decision Engine
            </div>
            <h2 className="text-sm font-extrabold text-white">Can I Afford Something?</h2>
            <p className="text-xs text-slate-300">
              Test a purchase before you buy and avoid cashflow traps.
            </p>
          </div>
          <button
            onClick={() => navigate('/affordability')}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/40 shrink-0 flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
          >
            Check <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Future You Teaser Card */}
      <div
        onClick={() => navigate('/future-you')}
        className="glass-card glass-card-hover cursor-pointer rounded-2xl p-3.5 flex items-center justify-between border border-white/10 bg-[#0f1526]/80"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Future You Projections</div>
            <div className="text-[10px] text-slate-400">See your savings in 6M, 1Y, 5Y</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};
