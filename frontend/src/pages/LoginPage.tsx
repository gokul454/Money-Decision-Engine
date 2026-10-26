import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Gokul');
  const [email, setEmail] = useState('gokul@moneyos.local');
  const [password, setPassword] = useState('password123');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setError('');
    try {
      await login('gokul@moneyos.local', 'password123');
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Demo login failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(name, email, password, currency);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Shield className="w-8 h-8 text-white stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Money OS</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Don't just track where money went. Decide where your money should go.
        </p>
      </div>

      {/* Demo 1-Click Login Card */}
      <div className="glass-card rounded-3xl p-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">1-Click Demo Profile</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Recommended
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Instant access with Gokul's pre-seeded ₹15,000 monthly income, realistic transactions & goals.
        </p>
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <span>Continue as Gokul (Demo)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[10px] font-semibold uppercase text-slate-500">Or custom account</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Custom Auth Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {isRegister && (
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gokul"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="gokul@moneyos.local"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-white mt-1 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 mt-2 transition-colors"
        >
          {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-indigo-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};
