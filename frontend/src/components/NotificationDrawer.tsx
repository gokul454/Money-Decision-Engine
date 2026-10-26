import React from 'react';
import { X, AlertTriangle, Calendar, Bell, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useMoney } from '../context/MoneyContext.js';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const { isNotifOpen, toggleNotif, overview, recurring } = useMoney();
  const navigate = useNavigate();

  if (!isNotifOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f1422] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-lg text-white">Actionable Insights & Alerts</h2>
          </div>
          <button
            onClick={toggleNotif}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {/* Spending alert */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-300">Spending Velocity Warning</h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  {overview?.safeToSpend.spendingVelocity.warningMessage ||
                    "You've used 72% of your weekly spending budget."}
                </p>
                <button
                  onClick={() => {
                    toggleNotif();
                    navigate('/affordability');
                  }}
                  className="mt-2 text-xs font-semibold text-amber-400 underline underline-offset-2 flex items-center gap-1"
                >
                  Check purchase affordability <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Upcoming Commitments
              </span>
              <span>{recurring.length} bills</span>
            </div>
            {recurring.map((rec) => (
              <div key={rec._id || rec.id} className="flex items-center justify-between py-1.5 border-t border-white/5 text-xs">
                <div>
                  <div className="font-medium text-white">{rec.name}</div>
                  <div className="text-[10px] text-slate-400">{rec.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-200">₹{rec.amount}</div>
                  <div className="text-[10px] text-indigo-300">Due soon</div>
                </div>
              </div>
            ))}
          </div>

          {/* Money Health advice */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-indigo-300">Smart Recommendation</h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Your Emergency Reserve currently covers ~45 days of basic burn rate. Maintain this cushion by keeping discretionary purchases under ₹1,240 this week.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={toggleNotif}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
