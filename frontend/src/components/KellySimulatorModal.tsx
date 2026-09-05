'use client';

import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, Calculator } from 'lucide-react';
import { Language, translations } from '../lib/translations';

interface KellySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentBankroll?: number;
  onApplySize: (amount: number) => void;
}

export function KellySimulatorModal({
  isOpen,
  onClose,
  lang,
  currentBankroll = 5420,
  onApplySize
}: KellySimulatorModalProps) {
  const [prob, setProb] = useState<number>(68); // 68%
  const [odds, setOdds] = useState<number>(1.96); // 1.96x
  const [bankroll, setBankroll] = useState<number>(currentBankroll);

  if (!isOpen) return null;

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  // Kelly calculation: f* = (bp - q) / b
  const p = prob / 100;
  const q = 1 - p;
  const b = odds - 1; // net odds
  const fStarRaw = b > 0 ? ((b * p) - q) / b : 0;
  const fStar = Math.max(0, Math.min(1, fStarRaw));
  const halfKelly = fStar / 2;

  const recommendedAmount = Math.round(fStar * bankroll);
  const halfKellyAmount = Math.round(halfKelly * bankroll);
  const evPct = Math.round(((p * odds) - 1) * 100);
  const isPositiveEdge = fStarRaw > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/10 space-y-6 overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>{t('kelly_modal_title')}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  f* = (bp - q) / b
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{t('kelly_modal_sub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Sliders */}
        <div className="space-y-4 relative z-10 bg-slate-950/60 p-5 rounded-2xl border border-white/[0.06]">
          {/* Slider 1: Probability */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">{t('kelly_prob')}</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{prob}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="1"
              value={prob}
              onChange={(e) => setProb(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Slider 2: Payout Odds */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">{t('kelly_odds')}</span>
              <span className="font-mono font-bold text-purple-400 text-sm">{odds.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.05"
              max="4.00"
              step="0.05"
              value={odds}
              onChange={(e) => setOdds(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Slider 3: Bankroll */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">{t('kelly_bankroll')}</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">${bankroll.toLocaleString()} USDso</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="100"
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 font-mono text-xs">
          {/* Full Kelly */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPositiveEdge 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t('kelly_optimal_f')}</div>
            <div className="text-xl font-extrabold mt-1">
              {isPositiveEdge ? `${(fStar * 100).toFixed(1)}%` : '0.0%'}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-sans">
              ${recommendedAmount.toLocaleString()} USDso
            </div>
          </div>

          {/* Half Kelly */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-purple-300">
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t('kelly_half')}</div>
            <div className="text-xl font-extrabold mt-1">
              {isPositiveEdge ? `${(halfKelly * 100).toFixed(1)}%` : '0.0%'}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-sans">
              ${halfKellyAmount.toLocaleString()} USDso
            </div>
          </div>

          {/* EV */}
          <div className={`p-4 rounded-2xl border ${
            evPct > 0 
              ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' 
              : 'bg-slate-900 border-white/10 text-slate-400'
          }`}>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t('kelly_ev')}</div>
            <div className="text-xl font-extrabold mt-1">
              {evPct > 0 ? `+${evPct}%` : `${evPct}%`}
            </div>
            <div className="text-[11px] mt-1 font-sans font-semibold">
              {isPositiveEdge ? t('kelly_edge_positive') : t('kelly_edge_negative')}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-2 relative z-10">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lang === 'en' ? 'Formula computed by Bayesian Arb agent on Somnia L1.' : "Formule exécutée par l'agent Bayesian Arb sur Somnia L1."}</span>
          </div>

          <button
            disabled={!isPositiveEdge || recommendedAmount <= 0}
            onClick={() => {
              onApplySize(recommendedAmount);
              onClose();
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <span>{t('kelly_apply_btn')} (${recommendedAmount})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
