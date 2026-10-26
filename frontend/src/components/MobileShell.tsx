import React from 'react';
import { Wifi, Battery, Signal, Bell, AlertTriangle } from 'lucide-react';
import { BottomNav } from './BottomNav.js';
import { useMoney } from '../context/MoneyContext.js';

export const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOffline, pendingSyncCount, toggleNotif, overview } = useMoney();
  const hasWarning = overview?.safeToSpend.spendingVelocity.status === 'CRITICAL';

  return (
    <div className="min-h-screen bg-[#05070b] text-slate-100 flex justify-center selection:bg-indigo-500/30">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-[#090d16] flex flex-col relative pb-24 shadow-2xl border-x border-white/5">
        
        {/* Status Bar */}
        <div className="sticky top-0 z-30 bg-[#090d16]/80 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 font-medium select-none">
          <span>9:41</span>

          {/* Dynamic Island Pill */}
          <div className="h-4 w-24 bg-black rounded-full flex items-center justify-center">
            {isOffline ? (
              <span className="text-[9px] text-amber-400 font-bold tracking-tight">OFFLINE MODE</span>
            ) : hasWarning ? (
              <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                PACING ALERT
              </span>
            ) : (
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Offline sync banner if offline or pending */}
        {(isOffline || pendingSyncCount > 0) && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {isOffline ? 'Offline mode active' : `${pendingSyncCount} offline expense pending sync`}
            </span>
            <span className="text-[10px] text-amber-200/80 font-mono">Auto-sync on</span>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 px-4 pt-2">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
