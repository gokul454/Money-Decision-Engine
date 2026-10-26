import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ArrowLeftRight, Plus, Target, User, Sparkles, TrendingUp } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';

export const BottomNav: React.FC = () => {
  const { openAddModal, pendingSyncCount } = useMoney();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, badge: pendingSyncCount > 0 ? pendingSyncCount : undefined },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
      <nav className="glass-card pointer-events-auto rounded-3xl px-3 py-2 flex items-center justify-between shadow-2xl shadow-black/80 border border-white/10 bg-[#0e131f]/90">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        {/* Transactions */}
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Transactions</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingSyncCount}
            </span>
          )}
        </NavLink>

        {/* Floating Add (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={openAddModal}
            aria-label="Add transaction"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-transform duration-200 border-2 border-[#090d16]"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Goals */}
        <NavLink
          to="/goals"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Goals</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
