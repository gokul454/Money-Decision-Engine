import React, { useState, useEffect } from 'react';
import { Settings, Check, AlertTriangle, Award, ShieldCheck, ChevronRight, RefreshCw, LogOut, Edit3, CreditCard, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.js';
import { useMoney } from '../context/MoneyContext.js';
import { api } from '../api/client.js';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { overview, refreshAll, resetDemo } = useMoney();

  const [isEditingSetup, setIsEditingSetup] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(15000);
  const [fixedExpenses, setFixedExpenses] = useState(5000);
  const [savingsTarget, setSavingsTarget] = useState(2000);
  const [emergencyReserve, setEmergencyReserve] = useState(2000);
  const [payday, setPayday] = useState(1);
  const [currentLiquidBalance, setCurrentLiquidBalance] = useState(8420);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (overview?.safeToSpend) {
      setMonthlyIncome(overview.safeToSpend.monthlyIncome);
      setFixedExpenses(overview.safeToSpend.fixedExpenses);
      setSavingsTarget(overview.safeToSpend.savingsTarget);
      setEmergencyReserve(overview.safeToSpend.emergencyReserve);
      setPayday(overview.safeToSpend.daysUntilPayday > 0 ? 1 : 1);
      setCurrentLiquidBalance(overview.safeToSpend.availableBalance);
    }
  }, [overview]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile({
        monthlyIncome: Number(monthlyIncome),
        fixedExpenses: Number(fixedExpenses),
        savingsTarget: Number(savingsTarget),
        emergencyReserve: Number(emergencyReserve),
        payday: Number(payday),
        currentLiquidBalance: Number(currentLiquidBalance),
      });
      await refreshAll();
      setIsEditingSetup(false);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      console.error('Failed to update financial setup', e);
    } finally {
      setSavingProfile(false);
    }
  };

  const health = overview?.healthScore || {
    score: 78,
    pillars: {
      spendingControl: { status: 'Good' },
      savingsHabit: { status: 'Good' },
      budgetAdherence: { status: 'Average' },
      financialStability: { status: 'Good' },
    },
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <button
          onClick={() => setIsEditingSetup(!isEditingSetup)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Hero Card matching reference design */}
      <div className="glass-card rounded-3xl p-4 border border-white/10 bg-gradient-to-b from-[#141b30]/90 to-[#0c101c]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full rounded-2xl bg-[#0e1424] flex items-center justify-center overflow-hidden">
              <span className="text-xl font-black text-white">G</span>
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">{user?.name || 'Gokul'}</h2>
            <div className="text-[11px] text-slate-400">Member since Aug 2025</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Level 2</span>
        </div>
      </div>

      {/* Money Health Score Card */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-b from-[#10172c]/90 to-[#0c101c]/90 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Money Health Score
        </div>

        <div className="flex items-center gap-6">
          {/* Radial score circle */}
          <div className="w-20 h-20 rounded-full bg-[#0b101e] border-4 border-emerald-500 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <span className="text-2xl font-black text-white">{health.score}</span>
            <span className="text-[9px] text-slate-400 font-bold">/100</span>
          </div>

          {/* 4 Pillars list matching screenshot */}
          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Spending Control
              </span>
              <span className="font-bold text-emerald-400">Good</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Savings Habit
              </span>
              <span className="font-bold text-emerald-400">Good</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Budget Adherence
              </span>
              <span className="font-bold text-amber-400">Average</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Financial Stability
              </span>
              <span className="font-bold text-emerald-400">Good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Badges Row */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Achievements</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="text-lg">🛡️</div>
            <div className="text-[9px] font-bold text-slate-200 leading-tight">7 Days On Track</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
            <div className="text-lg">🎯</div>
            <div className="text-[9px] font-bold text-slate-200 leading-tight">First Goal Set</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="text-lg">⚡</div>
            <div className="text-[9px] font-bold text-slate-200 leading-tight">Savings Streak</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
            <div className="text-lg">🏆</div>
            <div className="text-[9px] font-bold text-slate-200 leading-tight">Smart Spender</div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Connected Accounts
        </h3>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs">
              HDFC
            </div>
            <div>
              <div className="text-xs font-bold text-white">HDFC Bank</div>
              <div className="text-[10px] text-slate-400 font-mono">•••• 5678</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
              UPI
            </div>
            <div>
              <div className="text-xs font-bold text-white">UPI (PhonePe)</div>
              <div className="text-[10px] text-emerald-400 font-medium">Connected</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Financial Setup Form */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 bg-[#0f1526]/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Financial Configuration</h3>
            <p className="text-[11px] text-slate-400">Controls the Money Engine formulas</p>
          </div>
          <button
            onClick={() => setIsEditingSetup(!isEditingSetup)}
            className="text-xs font-semibold text-indigo-400 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingSetup ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingSetup ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium">Monthly Income (₹)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Fixed Expenses (₹)</label>
                <input
                  type="number"
                  value={fixedExpenses}
                  onChange={(e) => setFixedExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium">Savings Target (₹)</label>
                <input
                  type="number"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Emergency Reserve (₹)</label>
                <input
                  type="number"
                  value={emergencyReserve}
                  onChange={(e) => setEmergencyReserve(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium">Liquid Balance (₹)</label>
                <input
                  type="number"
                  value={currentLiquidBalance}
                  onChange={(e) => setCurrentLiquidBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Payday (Day of month)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={payday}
                  onChange={(e) => setPayday(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white mt-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
            >
              {savingProfile ? 'Updating Engines...' : 'Save Configuration'}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="text-[10px] text-slate-400">Monthly Income</div>
              <div className="font-extrabold text-white">₹{monthlyIncome.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="text-[10px] text-slate-400">Fixed Expenses</div>
              <div className="font-extrabold text-white">₹{fixedExpenses.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="text-[10px] text-slate-400">Savings Target</div>
              <div className="font-extrabold text-white">₹{savingsTarget.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="text-[10px] text-slate-400">Emergency Reserve</div>
              <div className="font-extrabold text-white">₹{emergencyReserve.toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone & Reset */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={resetDemo}
          className="py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>

        <button
          onClick={logout}
          className="py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 border border-rose-500/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
