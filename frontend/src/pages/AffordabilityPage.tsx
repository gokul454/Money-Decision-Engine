import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Headphones, AlertTriangle, Calendar, CheckCircle2, XCircle, Clock, BellRing, Bookmark, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMoney } from '../context/MoneyContext.js';
import { api } from '../api/client.js';
import { AffordabilityResult } from '../types/index.js';

const QUICK_PRESETS = [
  { name: 'Sony WH-1000XM5 Headphones', price: 2499, icon: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80' },
  { name: 'Starbucks Hazelnut Latte', price: 240, icon: 'Coffee', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80' },
  { name: 'Nike Running Shoes', price: 4800, icon: 'ShoppingBag', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' },
  { name: 'Weekend Team Dinner', price: 750, icon: 'Utensils', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80' },
];

export const AffordabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { overview } = useMoney();

  const [itemName, setItemName] = useState('Sony WH-1000XM5 Headphones');
  const [itemPrice, setItemPrice] = useState<string>('2499');
  const [activeImage, setActiveImage] = useState<string>(QUICK_PRESETS[0].image);
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [watchlistSaved, setWatchlistSaved] = useState(false);
  const [remindSaved, setRemindSaved] = useState(false);

  const runEvaluation = async (nameToEval: string, priceToEval: number) => {
    if (!nameToEval || isNaN(priceToEval) || priceToEval <= 0) return;
    setEvaluating(true);
    try {
      const evaluation = await api.checkAffordability(nameToEval, priceToEval);
      setResult(evaluation);
      if (evaluation.verdict === 'SAFE') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Affordability check failed', err);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation(itemName, parseFloat(itemPrice) || 2499);
  }, []);

  const handlePriceChange = (newPrice: string) => {
    setItemPrice(newPrice);
    const num = parseFloat(newPrice);
    if (!isNaN(num) && num > 0) {
      runEvaluation(itemName, num);
    }
  };

  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setItemName(preset.name);
    setItemPrice(preset.price.toString());
    setActiveImage(preset.image);
    runEvaluation(preset.name, preset.price);
  };

  const isNotRecommended = result?.verdict === 'NOT_RECOMMENDED';
  const isWait = result?.verdict === 'WAIT';
  const isSafe = result?.verdict === 'SAFE';

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white">Can I afford this?</h1>
        <button
          onClick={() => alert('The Decision Engine evaluates this item against your weekly safe-to-spend limit, emergency cushion, fixed bills, and saving goals.')}
          className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
              itemName === preset.name
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            {preset.name.split(' ')[0]} ₹{preset.price}
          </button>
        ))}
      </div>

      {/* Item Display & Price Input */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 bg-gradient-to-b from-[#10162a]/90 to-[#0c101c]/90 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                runEvaluation(e.target.value, parseFloat(itemPrice) || 0);
              }}
              placeholder="What do you want to buy?"
              className="w-full text-sm font-semibold text-white bg-transparent border-b border-white/10 pb-1 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-400">₹</span>
              <input
                type="number"
                value={itemPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="text-3xl sm:text-4xl font-extrabold text-white bg-transparent focus:outline-none w-36 tracking-tight"
              />
            </div>
          </div>

          {/* Product Image preview matching screenshot */}
          <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
            <img
              src={activeImage}
              alt={itemName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Decision Verdict Banner */}
      {result && (
        <div
          className={`p-4 rounded-3xl border transition-all ${
            isNotRecommended
              ? 'bg-rose-950/40 border-rose-500/30'
              : isWait
              ? 'bg-amber-950/40 border-amber-500/30'
              : 'bg-emerald-950/40 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isNotRecommended ? 'bg-rose-500 animate-ping' : isWait ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <h3
              className={`text-sm font-extrabold uppercase tracking-wide ${
                isNotRecommended ? 'text-rose-400' : isWait ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {result.verdictBadge}
            </h3>
          </div>

          <p className="text-xs text-slate-300 mb-4">{result.primaryReason}</p>

          {/* Breakdown Numbers Table */}
          <div className="space-y-2 py-3 px-3.5 rounded-2xl bg-black/30 border border-white/5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Safe to spend</span>
              <span className="font-bold text-emerald-400">
                ₹{result.safeToSpend.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Purchase amount</span>
              <span className="font-bold text-rose-400">
                -₹{result.itemPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">After purchase</span>
              <span
                className={`font-extrabold ${
                  result.difference < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {result.difference < 0 ? '-' : '+'}₹
                {Math.abs(result.difference).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* When can you safely buy? Card */}
      {result && result.betterOption && (
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">When can you safely buy?</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="text-sm font-bold text-rose-400">
            {result.betterOption.actionPrompt}
          </div>

          {/* Timeline progress track */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                style={{ width: `${Math.max(20, Math.min(100, 100 - (result.betterOption.recommendedWaitDays * 5)))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{result.betterOption.safePurchaseDate}</span>
              <span className="font-mono text-indigo-400 font-semibold">Payday reset</span>
            </div>
          </div>
        </div>
      )}

      {/* What will happen if you buy today? Card */}
      {result && (
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-[#0f1526]/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            What will happen if you buy today?
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="flex items-center gap-2 text-slate-300">
                <span>🍽️</span> Food Budget
              </span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  result.impacts.foodBudget === 'Safe' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {result.impacts.foodBudget === 'Safe' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {result.impacts.foodBudget === 'Safe' ? 'Safe' : 'At Risk'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="flex items-center gap-2 text-slate-300">
                <span>🎯</span> Savings Goal
              </span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  result.impacts.savingsGoal === 'On Track' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.impacts.savingsGoal === 'On Track' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {result.impacts.savingsGoal}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-300">
                <span>💳</span> Weekly Balance
              </span>
              <span
                className={`font-semibold ${
                  result.impacts.weeklyBalance === 'Healthy' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.impacts.weeklyBalance}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => {
            setWatchlistSaved(true);
            setTimeout(() => setWatchlistSaved(false), 2500);
          }}
          className="py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <Bookmark className="w-4 h-4 text-indigo-400" />
          {watchlistSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}
        </button>

        <button
          onClick={() => {
            setRemindSaved(true);
            setTimeout(() => setRemindSaved(false), 2500);
          }}
          className="py-3 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <BellRing className="w-4 h-4" />
          {remindSaved ? 'Reminder Scheduled!' : 'Remind Me Later'}
        </button>
      </div>
    </div>
  );
};
