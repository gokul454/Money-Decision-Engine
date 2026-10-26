import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Lightbulb, Moon, Zap, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';

export const InsightsPage: React.FC = () => {
  const { insights } = useMoney();
  const [period, setPeriod] = useState<'this_month' | 'last_month'>('this_month');

  const data = insights || {
    totalSpent: 8580,
    lastMonthTotalSpent: 7460,
    monthOverMonthPercentageDiff: 15,
    categories: [
      { category: 'Food & Dining', amount: 2340, percentage: 28, color: '#f43f5e', icon: 'Utensils', transactionCount: 6 },
      { category: 'Shopping', amount: 1850, percentage: 22, color: '#a855f7', icon: 'ShoppingBag', transactionCount: 4 },
      { category: 'Transport', amount: 1120, percentage: 13, color: '#38bdf8', icon: 'Car', transactionCount: 3 },
      { category: 'Entertainment', amount: 850, percentage: 10, color: '#fb923c', icon: 'Film', transactionCount: 2 },
      { category: 'Bills & Utilities', amount: 720, percentage: 9, color: '#10b981', icon: 'Receipt', transactionCount: 1 },
      { category: 'Others', amount: 1700, percentage: 18, color: '#94a3b8', icon: 'MoreHorizontal', transactionCount: 3 },
    ],
    behavioralInsights: [
      {
        id: 'late-night',
        type: 'LATE_NIGHT' as const,
        title: '🌙 Late-night spending',
        icon: 'Moon',
        description: 'You spend 42% more between 8 PM – 11 PM. Most purchases are food deliveries.',
        metric: '₹580',
        severity: 'warning' as const,
      },
      {
        id: 'impulse',
        type: 'IMPULSE' as const,
        title: '⚡ Impulse spending',
        icon: 'Zap',
        description: '₹2,340 spent on impulse purchases this month.',
        metric: '₹2,340',
        severity: 'warning' as const,
      },
    ],
    primaryHighlight: {
      title: 'Insight',
      text: 'You spend the most on Food & Dining between 8 PM - 11 PM.',
    },
  };

  const chartData = data.categories.map((c) => ({
    name: c.category,
    value: c.amount,
    color: c.color,
    percentage: c.percentage,
  }));

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-white">Spending Insights</h1>
        <button className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* Period Toggle Pills */}
      <div className="flex bg-slate-800/80 rounded-2xl p-1 border border-white/10">
        <button
          onClick={() => setPeriod('this_month')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            period === 'this_month'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setPeriod('last_month')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            period === 'last_month'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Last Month
        </button>
      </div>

      {/* Hero Spending Headline */}
      <div className="text-center space-y-1 py-1">
        <h2 className="text-base font-extrabold text-white">
          You've spent ₹{data.totalSpent.toLocaleString('en-IN')} {period === 'this_month' ? 'this month' : 'last month'}
        </h2>
        <p className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1">
          <span>That's {data.monthOverMonthPercentageDiff}% more than last month</span>
        </p>
      </div>

      {/* Donut Chart with Center Total */}
      <div className="glass-card rounded-3xl p-4 border border-white/10 bg-gradient-to-b from-[#101526]/90 to-[#0c101c]/90 relative">
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                contentStyle={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Hole Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-white">
              ₹{data.totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          {data.categories.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-slate-200">{cat.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white font-mono">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </span>
                <span className="font-semibold text-slate-400 w-8 text-right">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Highlight Insight Card */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            {data.primaryHighlight.title}
          </div>
          <p className="text-xs text-amber-100 font-medium leading-relaxed">
            {data.primaryHighlight.text}
          </p>
        </div>
      </div>

      {/* Behavioral Insight Cards */}
      <div className="grid grid-cols-1 gap-3">
        {data.behavioralInsights.map((insight) => (
          <div
            key={insight.id}
            className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">{insight.title}</h3>
              {insight.metric && (
                <span className="text-xs font-mono font-bold text-rose-400">{insight.metric}</span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
