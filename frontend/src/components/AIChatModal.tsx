import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowUpRight, CheckCircle2, AlertTriangle, ShieldCheck, Zap, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../api/client.js';
import { useMoney } from '../context/MoneyContext.js';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  cardType?: string;
  cardData?: any;
  quickReplies?: string[];
}

export const AIChatModal: React.FC = () => {
  const { refreshAll } = useMoney();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "Hi Gokul! 👋 I'm **Nova**, your personal Money OS financial copilot.\n\nI monitor your real-time **Safe-to-Spend**, test prospective purchases, analyze spending patterns, and keep your savings goals on track.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'Can I afford a ₹3,000 watch?',
        'How much can I safely spend this week?',
        'Why am I overspending?',
        'Log ₹260 for lunch',
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cardType: res.cardType,
        cardData: res.cardData,
        quickReplies: res.quickReplies,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If a transaction was logged or state altered, refresh UI
      if (res.cardType === 'transaction_logged') {
        refreshAll();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: "I'm temporarily having trouble connecting to the Money Engine. Please check your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Glowing AI Copilot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs shadow-xl shadow-indigo-600/40 border border-white/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <span className="tracking-tight font-extrabold">Ask AI</span>
      </button>

      {/* AI Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md h-[90vh] sm:h-[650px] bg-[#0c101c] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#141b30] to-[#0f1424] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-md shadow-indigo-500/30">
                  <div className="w-full h-full rounded-2xl bg-[#0e1424] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-300" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-sm text-white">Nova AI</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Live Copilot
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Powered by Deterministic Money Engine</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 text-[10px]">
                          ✨
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-500/20 font-medium'
                            : 'glass-card bg-[#121829] border border-white/10 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>

                        {/* Affordability Decision Card */}
                        {msg.cardType === 'affordability' && msg.cardData && (
                          <div
                            className={`mt-2.5 p-3 rounded-xl border text-xs space-y-2 ${
                              msg.cardData.verdict === 'NOT_RECOMMENDED'
                                ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                                : msg.cardData.verdict === 'WAIT'
                                ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="uppercase tracking-wider text-[10px]">
                                {msg.cardData.verdictBadge}
                              </span>
                              <span className="font-mono">₹{msg.cardData.itemPrice}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-white/10">
                              <div>
                                <span className="text-slate-400 text-[10px]">Safe to spend:</span>
                                <div className="font-bold text-white">₹{msg.cardData.safeToSpend}</div>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px]">Difference:</span>
                                <div className="font-bold text-rose-300">
                                  {msg.cardData.difference < 0 ? '-' : '+'}₹
                                  {Math.abs(msg.cardData.difference)}
                                </div>
                              </div>
                            </div>

                            {msg.cardData.betterOption?.actionPrompt && (
                              <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 pt-1 border-t border-white/10">
                                <span>📅 {msg.cardData.betterOption.actionPrompt}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Transaction Logged Confirmation */}
                        {msg.cardType === 'transaction_logged' && msg.cardData && (
                          <div className="mt-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Recorded in Transactions
                            </span>
                            <span className="font-mono font-bold">₹{msg.cardData.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[9px] text-slate-500 px-1">{msg.timestamp}</span>

                    {/* Quick Replies Chips */}
                    {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 pl-8">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            onClick={() => handleSend(qr)}
                            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[10px] text-indigo-300 border border-indigo-500/20 font-medium transition-all"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-[11px]">Nova is querying the Money Engine...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#0d1222] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Nova anything about your money..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
