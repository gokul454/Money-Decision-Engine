import React, { useState } from 'react';
import { Plus, Shield, Smartphone, Plane, Target, X, Check, Calendar, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMoney } from '../context/MoneyContext.js';
import { GoalItem } from '../types/index.js';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useMoney();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showAddModal, setShowAddModal] = useState(false);

  // New goal state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('2000');
  const [selectedIcon, setSelectedIcon] = useState('Shield');

  const defaultGoals: GoalItem[] = [
    {
      _id: 'g1',
      userId: 'user',
      name: 'Emergency Fund',
      categoryIcon: 'Shield',
      targetAmount: 50000,
      currentAmount: 18500,
      targetDate: '2026-12-31',
      monthlyContribution: 2000,
      status: 'active',
      priority: 1,
    },
    {
      _id: 'g2',
      userId: 'user',
      name: 'New Phone',
      categoryIcon: 'Smartphone',
      targetAmount: 35000,
      currentAmount: 9200,
      targetDate: '2026-11-30',
      monthlyContribution: 3000,
      status: 'active',
      priority: 2,
    },
    {
      _id: 'g3',
      userId: 'user',
      name: 'Europe Trip',
      categoryIcon: 'Plane',
      targetAmount: 75000,
      currentAmount: 15800,
      targetDate: '2027-06-30',
      monthlyContribution: 4000,
      status: 'active',
      priority: 3,
    },
  ];

  const displayGoals = (goals && goals.length > 0 ? goals : defaultGoals).filter(
    (g) => g.status === activeTab
  );

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-6 h-6 text-sky-400" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-purple-400" />;
      case 'Plane':
        return <Plane className="w-6 h-6 text-amber-400" />;
      default:
        return <Target className="w-6 h-6 text-emerald-400" />;
    }
  };

  const getIconBg = (iconName?: string) => {
    switch (iconName) {
      case 'Shield':
        return 'bg-sky-500/20 border-sky-500/30';
      case 'Smartphone':
        return 'bg-purple-500/20 border-purple-500/30';
      case 'Plane':
        return 'bg-amber-500/20 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 border-emerald-500/30';
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    await addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      categoryIcon: selectedIcon,
      status: 'active',
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setShowAddModal(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  const handleDeposit = async (g: GoalItem) => {
    const addAmt = 1000;
    const newAmt = g.currentAmount + addAmt;
    const isNowCompleted = newAmt >= g.targetAmount;
    await updateGoal(g._id || g.id!, {
      currentAmount: newAmt,
      status: isNowCompleted ? 'completed' : 'active',
    });
    if (isNowCompleted) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-white">My Goals</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs matching screenshot */}
      <div className="flex bg-slate-800/80 rounded-2xl p-1 border border-white/10">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Goal Cards */}
      <div className="space-y-3">
        {displayGoals.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <p>No {activeTab} goals found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs text-indigo-400 font-semibold underline"
            >
              Create a financial goal
            </button>
          </div>
        ) : (
          displayGoals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );
            const targetMonthStr = new Date(goal.targetDate).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={goal._id || goal.id}
                className="glass-card rounded-3xl p-4 border border-white/10 bg-gradient-to-b from-[#111728]/90 to-[#0c101c]/90 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getIconBg(
                        goal.categoryIcon
                      )}`}
                    >
                      {getIcon(goal.categoryIcon)}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">{goal.name}</h2>
                      <div className="text-xs font-extrabold text-slate-300 font-mono mt-0.5">
                        ₹{goal.currentAmount.toLocaleString('en-IN')}{' '}
                        <span className="text-slate-500 font-normal">
                          / ₹{goal.targetAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white font-mono">{percent}%</span>
                    <div className="text-[10px] text-slate-400">Target: {targetMonthStr}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Quick deposit footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Monthly save: <span className="text-slate-200 font-bold">₹{goal.monthlyContribution}</span>
                  </span>
                  <button
                    onClick={() => handleDeposit(goal)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold hover:bg-indigo-600/50 transition-colors"
                  >
                    +₹1,000 Deposit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0d121f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Create Financial Goal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Goal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vacation to Goa"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Target (₹)</label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Current (₹)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold">Icon</label>
                <div className="flex gap-2 mt-1">
                  {['Shield', 'Smartphone', 'Plane', 'Target'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSelectedIcon(ic)}
                      className={`flex-1 py-2 rounded-xl border flex items-center justify-center ${
                        selectedIcon === ic
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-800 border-white/5 text-slate-400'
                      }`}
                    >
                      {getIcon(ic)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-2"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
