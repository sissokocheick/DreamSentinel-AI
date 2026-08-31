'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Crosshair, TrendingUp, AlertTriangle, PlayCircle } from 'lucide-react';

interface ArbitrageOpp {
  market_id: string;
  symbol: string;
  type: string;
  description: string;
  side: string;
  edge: number;
  confidence: number;
  kelly_fraction: number;
  model_prob: number;
  market_prob: number;
  timestamp: number;
}

export function ArbitrageScanner() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpp[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/arbitrage/scan');
      if (!res.ok) throw new Error('Erreur réseau lors du scan');
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities);
        setLastScan(new Date());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanMarkets();
    const interval = setInterval(scanMarkets, 15000); // Auto-scan every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Crosshair className="text-cyan-400 w-6 h-6" /> Scanner d'Arbitrage Cross-Market
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Recherche continue des inefficacités de prix et déséquilibres de probabilités sur DreamDEX.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Dernier scan</div>
            <div className="text-sm font-mono text-cyan-400">
              {loading ? 'Analyse en cours...' : lastScan ? lastScan.toLocaleTimeString() : 'En attente'}
            </div>
          </div>
          
          <button 
            onClick={scanMarkets}
            disabled={loading}
            className="w-12 h-12 rounded-2xl bg-surface/50 border border-surfaceBorder hover:border-cyan-500/50 hover:bg-cyan-500/10 flex items-center justify-center transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => (
          <div key={`${opp.market_id}-${idx}`} className="glass-panel rounded-3xl p-5 border border-surfaceBorder/60 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-2
                    bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/20">
                    {opp.type}
                  </div>
                  <h3 className="text-lg font-black text-slate-100">{opp.symbol}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  opp.side === 'YES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  opp.side === 'NO' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                }`}>
                  {opp.side}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-5 min-h-[40px] leading-relaxed">
                {opp.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-surface/40 border border-surfaceBorder/50">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Edge (Avantage)</div>
                  <div className="text-lg font-mono font-black text-emerald-400">
                    +{(opp.edge * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-surface/40 border border-surfaceBorder/50">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Confiance IA</div>
                  <div className="text-lg font-mono font-black text-cyan-400">
                    {(opp.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mb-5 px-1">
                <div>Prob Marché: <span className="font-mono text-slate-300">{(opp.market_prob * 100).toFixed(1)}%</span></div>
                <TrendingUp className="w-4 h-4 text-slate-600 mx-2" />
                <div>Prob Modèle: <span className="font-mono text-cyan-400">{(opp.model_prob * 100).toFixed(1)}%</span></div>
              </div>

              <button className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                bg-surfaceBorder/30 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/50">
                <Zap className="w-4 h-4" /> Exploiter l'Arbitrage
              </button>
            </div>
          </div>
        ))}

        {opportunities.length === 0 && !loading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 glass-panel rounded-3xl">
            <Crosshair className="w-12 h-12 mb-3 opacity-20" />
            <p>Aucune opportunité d'arbitrage détectée pour le moment.</p>
            <p className="text-xs mt-1 opacity-60">Le scanner tourne en tâche de fond...</p>
          </div>
        )}
      </div>
    </div>
  );
}
