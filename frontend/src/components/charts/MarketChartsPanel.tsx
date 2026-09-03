'use client';

import React, { useState, useEffect } from 'react';
import { CandlestickChart } from './CandlestickChart';
import { ProbabilityChart } from './ProbabilityChart';
import { DepthChart } from './DepthChart';
import { Market } from '../../types';
import { BarChart2, TrendingUp, Layers } from 'lucide-react';

type ChartView = 'candle' | 'probability' | 'depth';

interface MarketChartsPanelProps {
  market: Market;
  aiProbability?: number;
  lang?: 'en' | 'fr';
}

export function MarketChartsPanel({ market, aiProbability = 0.682, lang = 'en' }: MarketChartsPanelProps) {
  const [activeView, setActiveView] = useState<ChartView>('candle');

  const tabs: { id: ChartView; label: string; icon: React.ElementType; description: string }[] = [
    { 
      id: 'candle', 
      label: lang === 'en' ? 'Spot Price' : 'Prix Spot', 
      icon: TrendingUp, 
      description: lang === 'en' ? 'Candles + 30s Volume' : 'Chandeliers + Volume 30s' 
    },
    { 
      id: 'probability', 
      label: lang === 'en' ? 'AI Probabilities' : 'Probabilités IA', 
      icon: BarChart2, 
      description: lang === 'en' ? 'Bayesian vs CLOB' : 'Bayésien vs CLOB' 
    },
    { 
      id: 'depth', 
      label: lang === 'en' ? 'CLOB Depth' : 'Profondeur CLOB', 
      icon: Layers, 
      description: lang === 'en' ? 'DreamDEX Orderbook' : 'Carnet d\'ordres DreamDEX' 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-surface/60 rounded-3xl border border-surfaceBorder overflow-hidden">
      
      {/* Chart type selector tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-800 bg-surface/80">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {isActive && <span className="text-[10px] text-slate-500 hidden md:inline">— {tab.description}</span>}
            </button>
          );
        })}

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0">
        {activeView === 'candle' && (
          <CandlestickChart
            symbol={market.symbol}
            strikePrice={market.strike_price}
            currentSpot={market.current_spot}
            color="cyan"
          />
        )}
        {activeView === 'probability' && (
          <ProbabilityChart
            marketId={market.market_id}
            aiProbability={aiProbability}
            marketProbability={market.implied_prob_yes}
          />
        )}
        {activeView === 'depth' && (
          <DepthChart
            yesBestBid={market.yes_best_bid}
            yesBestAsk={market.yes_best_ask}
            noBestBid={market.no_best_bid}
            noBestAsk={market.no_best_ask}
          />
        )}
      </div>
    </div>
  );
}
