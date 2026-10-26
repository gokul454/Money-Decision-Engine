import React, { useState } from 'react';
import { X, Utensils, ShoppingBag, Car, Receipt, MoreHorizontal, ArrowDownLeft, ArrowUpRight, Check, Zap } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';

const CATEGORIES = [
  { name: 'Food & Dining', icon: Utensils, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { name: 'Transport', icon: Car, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Bills & Utilities', icon: Receipt, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Other', icon: MoreHorizontal, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

export const AddExpenseModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, addTransaction } = useMoney();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('450');
  const [category, setCategory] = useState<string>('Shopping');
  const [description, setDescription] = useState<string>('Flipkart order');
  const [dateType, setDateType] = useState<'Today' | 'Yesterday' | 'Custom'>('Today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'NetBanking'>('UPI');
  const [isImpulse, setIsImpulse] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setSaving(true);
    try {
      let txDate = new Date();
      if (dateType === 'Yesterday') {
        txDate = new Date(Date.now() - 86400000);
      } else if (dateType === 'Custom' && customDate) {
        txDate = new Date(customDate);
      }

      await addTransaction({
        type,
        amount: num,
        category,
        description: description.trim() || category,
        merchant: description.trim() || category,
        paymentMethod,
        transactionDate: txDate.toISOString(),
        isImpulse,
      });

      closeAddModal();
      // Reset form
      setAmount('450');
      setDescription('');
    } catch (error) {
      console.error('Failed to add transaction', error);
    } finally {
      setSaving(false);
    }
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.name === category) || CATEGORIES[2];
  const IconComponent = activeCategoryObj.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d121f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={closeAddModal}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Type Switcher */}
          <div className="flex bg-slate-800/80 rounded-full p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Big Amount Input */}
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-extrabold text-slate-400">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="text-4xl sm:text-5xl font-extrabold text-white bg-transparent text-center focus:outline-none w-48 tracking-tight"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Enter transaction amount</p>
          </div>

          {/* Category Chip Display */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-white/10">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${activeCategoryObj.color} border`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Category</label>
              <div className="font-semibold text-white text-sm">{category}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsImpulse(!isImpulse)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 border transition-all ${
                isImpulse
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-700/40 text-slate-400 border-white/5 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Impulse
            </button>
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for? (e.g. Lunch with team)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-800/60 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-2">
            {(['Today', 'Yesterday', 'Custom'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDateType(d)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  dateType === d
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                    : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {dateType === 'Custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
            />
          )}

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/60 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </div>

          {/* Recent Categories Selector */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Recent Categories</span>
            <div className="flex items-center justify-between gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all flex-1 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-medium truncate w-full text-center">
                      {cat.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : type === 'expense' ? 'Save Expense' : 'Save Income'}
          </button>
        </form>
      </div>
    </div>
  );
};
