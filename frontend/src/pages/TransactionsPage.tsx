import React, { useState } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, Utensils, ShoppingBag, Car, Film, Receipt, MoreHorizontal, Plus } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';
import { TransactionItem } from '../types/index.js';
import { formatDateRelative, formatCurrency } from '../utils/formatters.js';

export const TransactionsPage: React.FC = () => {
  const { transactions, deleteTransaction, openAddModal } = useMoney();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = transactions.filter((t) => {
    if (activeTab !== 'all' && t.type !== activeTab) return false;
    if (selectedCategory !== 'All' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        t.description?.toLowerCase().includes(s) ||
        t.merchant?.toLowerCase().includes(s) ||
        t.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Group by date string (Today, Yesterday, or formatted date)
  const groups: Record<string, { total: number; items: TransactionItem[] }> = {};
  for (const t of filtered) {
    const key = formatDateRelative(t.transactionDate);
    if (!groups[key]) {
      groups[key] = { total: 0, items: [] };
    }
    groups[key].items.push(t);
    if (t.type === 'expense') {
      groups[key].total += t.amount;
    } else if (t.type === 'income') {
      groups[key].total -= t.amount;
    }
  }

  const getMerchantIcon = (merchantName: string, category: string) => {
    const name = merchantName?.toLowerCase() || '';
    if (name.includes('zomato') || name.includes('swiggy') || name.includes('starbucks') || category.includes('Food')) {
      return { icon: Utensils, bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (name.includes('uber') || category.includes('Transport')) {
      return { icon: Car, bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    }
    if (name.includes('amazon') || name.includes('flipkart') || category.includes('Shopping')) {
      return { icon: ShoppingBag, bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
    if (category.includes('Entertainment')) {
      return { icon: Film, bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    if (category.includes('Bills')) {
      return { icon: Receipt, bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    return { icon: MoreHorizontal, bg: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-white">Transactions</h1>
        <button
          onClick={openAddModal}
          className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 hover:text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Filter Tabs matching reference image */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'expense', 'income', 'transfer'] as const).map((tab) => {
          const label = tab === 'all' ? 'All' : tab === 'expense' ? 'Expenses' : tab === 'income' ? 'Income' : 'Transfer';
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                isSelected
                  ? tab === 'expense'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
                    : tab === 'income'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grouped Transaction List */}
      <div className="space-y-4">
        {Object.keys(groups).length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <p>No transactions found.</p>
            <button
              onClick={openAddModal}
              className="text-xs text-indigo-400 font-semibold underline underline-offset-2"
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          Object.entries(groups).map(([dateGroup, groupData]) => (
            <div key={dateGroup} className="space-y-2">
              {/* Group Header: Date and Group Total */}
              <div className="flex items-center justify-between px-1 text-xs font-bold">
                <span className="text-slate-300">{dateGroup}</span>
                <span className="text-slate-400 font-mono">
                  {groupData.total >= 0 ? `₹${groupData.total}` : `-₹${Math.abs(groupData.total)}`}
                </span>
              </div>

              {/* Transactions in Group */}
              <div className="space-y-2">
                {groupData.items.map((tx) => {
                  const merchantInfo = getMerchantIcon(tx.merchant || tx.description, tx.category);
                  const Icon = merchantInfo.icon;
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx._id || tx.id}
                      className="glass-card rounded-2xl p-3 flex items-center justify-between border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${merchantInfo.bg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{tx.merchant || tx.description}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span>{tx.category}</span>
                            {tx.timeOfDay && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{tx.timeOfDay}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={`text-sm font-extrabold font-mono ${
                              isExpense ? 'text-slate-100' : isIncome ? 'text-emerald-400' : 'text-indigo-400'
                            }`}
                          >
                            {isExpense ? `-₹${tx.amount}` : `+₹${tx.amount}`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {tx.paymentMethod}
                          </div>
                        </div>

                        {/* Quick Delete */}
                        <button
                          onClick={() => deleteTransaction(tx._id || tx.id!)}
                          aria-label="Delete"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
