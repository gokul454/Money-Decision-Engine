import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../api/client.js';
import { HorizonForecast } from '../types/index.js';

export const FutureYouPage: React.FC = () => {
  const navigate = useNavigate();
  const [horizon, setHorizon] = useState<'6months' | '1year' | '5years'>('6months');
  const [forecastData, setForecastData] = useState<HorizonForecast | null>(null);

  useEffect(() => {
    api.getForecast(horizon).then((res: any) => {
      setForecastData(res);
    }).catch((err) => console.error('Forecast load error', err));
  }, [horizon]);

  const defaultChartData = [
    { period: 'Aug', baselineSavings: 2000, improvedSavings: 2500 },
    { period: 'Sep', baselineSavings: 4200, improvedSavings: 5300 },
    { period: 'Oct', baselineSavings: 6800, improvedSavings: 8600 },
    { period: 'Nov', baselineSavings: 9600, improvedSavings: 12400 },
    { period: 'Dec', baselineSavings: 12500, improvedSavings: 16800 },
    { period: 'Jan', baselineSavings: 15600, improvedSavings: 21600 },
  ];

  const chartData = forecastData?.chartData || defaultChartData;
  const baselineTotal = forecastData?.baselineTotal || 15600;
  const improvedTotal = forecastData?.improvedTotal || 21600;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white">Future You</h1>
        <button
          onClick={() => alert('Future You projects your wealth trajectory based on your actual monthly savings rate compared to an optimized habit with +₹500/month boost.')}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Horizon Selector Tabs */}
      <div className="flex bg-slate-800/80 rounded-2xl p-1 border border-white/10">
        {(['6months', '1year', '5years'] as const).map((h) => {
          const label = h === '6months' ? '6 Months' : h === '1year' ? '1 Year' : '5 Years';
          const isSelected = horizon === h;
          return (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Card 1: If you continue like this... (Baseline) */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-b from-[#16121e]/90 to-[#0c101c]/90 space-y-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            If you continue like this...
          </div>
          <div className="text-[11px] text-slate-400">Projected Savings</div>
          <div className="text-2xl font-extrabold text-white mt-0.5">
            ₹{baselineTotal.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Baseline Red/Amber Chart */}
        <div className="h-32 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={9}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Savings']}
                contentStyle={{ background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="baselineSavings"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#redGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: If you improve by ₹500/month (Green) */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-b from-[#0e1d1a]/90 to-[#0c101c]/90 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              If you improve by ₹500/month
            </div>
            <div className="text-[11px] text-slate-400">Projected Savings</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              ₹{improvedTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              +₹{(improvedTotal - baselineTotal).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Improved Green Chart */}
        <div className="h-32 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={9}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Saved']}
                contentStyle={{ background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="improvedSavings"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#greenGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: What can you do? Actionable Advice Card */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What can you do?
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {forecastData?.actionableTip || 'Reduce dining out by 2 times/week and save ~ ₹1,200/month'}
          </p>
        </div>
        <button
          onClick={() => navigate('/affordability')}
          className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
