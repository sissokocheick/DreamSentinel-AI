'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, TrendingUp, Award, AlertTriangle, BarChart2, List, ChevronUp, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BacktestTrade {
  trade_id: number;
  market_symbol: string;
  outcome: string;
  entry_price: number;
  model_prob: number;
  market_prob: number;
  edge: number;
  kelly_fraction: number;
  amount_usdso: number;
  result: 'WIN' | 'LOSS';
  pnl_usdso: number;
  timestamp: number;
}

interface BacktestResult {
  strategy_name: string;
  initial_capital: number;
  final_capital: number;
  total_pnl: number;
  total_pnl_pct: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  equity_curve: { time: number; value: number }[];
  trades: BacktestTrade[];
  params_used: Record<string, any>;
}

// ─── Equity Curve Chart (via lightweight-charts v5) ─────────────────────────

function EquityChart({ curve, initialCapital }: { curve: { time: number; value: number }[]; initialCapital: number }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || curve.length === 0) return;

    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }

      const isProfit = curve[curve.length - 1]?.value >= initialCapital;
      const lineColor = isProfit ? '#10b981' : '#f43f5e';
      const topColor = isProfit ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)';

      const chart = lc.createChart(chartRef.current, {
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#94a3b8',
          fontFamily: "'Inter', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30,41,59,0.5)' },
          horzLines: { color: 'rgba(30,41,59,0.5)' },
        },
        rightPriceScale: { borderColor: 'rgba(30,41,59,0.6)' },
        timeScale: { borderColor: 'rgba(30,41,59,0.6)', timeVisible: true },
        handleScroll: false,
        handleScale: false,
      });
      chartInstance.current = chart;

      const areaSeries = chart.addSeries(lc.AreaSeries, {
        lineColor,
        topColor,
        bottomColor: 'rgba(0,0,0,0.02)',
        lineWidth: 2,
        priceFormat: { type: 'custom' as any, formatter: (v: number) => `$${v.toFixed(0)}` },
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });

      // Initial capital baseline
      areaSeries.createPriceLine({
        price: initialCapital,
        color: '#64748b',
        lineWidth: 1,
        lineStyle: lc.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Capital initial',
      });

      areaSeries.setData(curve.map(p => ({ time: p.time as any, value: p.value })));
      chart.timeScale().fitContent();
    });

    return () => { if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; } };
  }, [curve, initialCapital]);

  useEffect(() => {
    if (!chartRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        chartInstance.current?.applyOptions({ width: e.contentRect.width, height: e.contentRect.height });
      }
    });
    ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  if (curve.length === 0) return null;
  return <div ref={chartRef} className="w-full h-full" />;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'cyan' }: { label: string; value: string; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    violet: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  };
  return (
    <div className={`rounded-2xl p-4 border ${colorMap[color] ?? colorMap['cyan']}`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-black font-mono ${colorMap[color]?.split(' ')[0]}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Slider Control ──────────────────────────────────────────────────────────

function SliderControl({
  label, value, min, max, step, format, onChange, description
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void; description?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-semibold">{label}</span>
        <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg">{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #06b6d4 ${pct}%, rgba(30,41,59,0.8) ${pct}%)`
          }}
        />
      </div>
      {description && <p className="text-[10px] text-slate-500">{description}</p>}
    </div>
  );
}

// ─── Main BacktestSimulator Component ────────────────────────────────────────

const STRATEGIES = [
  { id: 'sentinel_alpha', label: 'Sentinel-Alpha', sub: 'High-Frequency Scalper', icon: '⚡' },
  { id: 'sentinel_bayes', label: 'Sentinel-BayesArb', sub: 'Statistical Arbitrage', icon: '🧠' },
  { id: 'sentinel_macro', label: 'Sentinel-Macro', sub: 'Delta-Hedged Events', icon: '🌐' },
];

export function BacktestSimulator() {
  // ── Params
  const [strategyId, setStrategyId] = useState('sentinel_bayes');
  const [capital, setCapital] = useState(10000);
  const [kellyScale, setKellyScale] = useState(0.5);
  const [minEdge, setMinEdge] = useState(0.035);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [days, setDays] = useState(30);
  const [tradesPerDay, setTradesPerDay] = useState(8);

  // ── State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chart' | 'trades'>('chart');
  const [progress, setProgress] = useState(0);

  const runBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Fake progress animation
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 90));
    }, 250);

    try {
      const res = await fetch('http://localhost:8000/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: strategyId,
          initial_capital: capital,
          kelly_scale: kellyScale,
          min_edge_threshold: minEdge,
          confidence_threshold: confidenceThreshold,
          num_simulated_days: days,
          trades_per_day: tradesPerDay,
        }),
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();

      if (!data.success) throw new Error('Backtest failed');
      setResult(data.result);
      setProgress(100);
    } catch (err: any) {
      setError(`Erreur: ${err.message}. Démarrez le backend avec: uvicorn server:app`);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }, [strategyId, capital, kellyScale, minEdge, confidenceThreshold, days, tradesPerDay]);

  const isProfit = result ? result.total_pnl >= 0 : true;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ── Left Panel: Controls ─────────────────────────────────────────── */}
      <div className="lg:col-span-4 space-y-5">

        {/* Strategy selector */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="text-cyan-400">🤖</span> Stratégie IA
          </h3>
          <div className="space-y-2">
            {STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => setStrategyId(s.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs transition-all border ${
                  strategyId === s.id
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-surface/60 border-surfaceBorder text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <div>
                  <div className="font-bold text-slate-200">{s.label}</div>
                  <div className="text-slate-500">{s.sub}</div>
                </div>
                {strategyId === s.id && <span className="ml-auto text-cyan-400">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="glass-panel rounded-3xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="text-violet-400">⚙️</span> Paramètres de Simulation
          </h3>

          <SliderControl
            label="Capital Initial" value={capital} min={1000} max={100000} step={1000}
            format={v => `$${v.toLocaleString()}`}
            onChange={setCapital}
            description="Capital de départ en USDso"
          />
          <SliderControl
            label="Kelly Scale" value={kellyScale} min={0.1} max={1.0} step={0.05}
            format={v => `${(v * 100).toFixed(0)}%`}
            onChange={setKellyScale}
            description="Fraction du critère Kelly appliquée (conservateur → agressif)"
          />
          <SliderControl
            label="Edge Minimum" value={minEdge} min={0.01} max={0.10} step={0.005}
            format={v => `${(v * 100).toFixed(1)}%`}
            onChange={setMinEdge}
            description="Edge bayésien minimum requis pour trader"
          />
          <SliderControl
            label="Confiance IA" value={confidenceThreshold} min={0.5} max={0.95} step={0.05}
            format={v => `${(v * 100).toFixed(0)}%`}
            onChange={setConfidenceThreshold}
            description="Seuil de confiance du modèle de sentiment"
          />
          <SliderControl
            label="Durée" value={days} min={7} max={90} step={7}
            format={v => `${v}j`}
            onChange={setDays}
            description="Nombre de jours simulés"
          />
          <SliderControl
            label="Trades / Jour" value={tradesPerDay} min={2} max={20} step={1}
            format={v => `${v}`}
            onChange={setTradesPerDay}
            description="Nombre d'opportunités ciblées par jour"
          />
        </div>

        {/* Run button */}
        <button
          onClick={runBacktest}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all
            bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500
            text-white shadow-xl shadow-cyan-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Simulation en cours… {progress.toFixed(0)}%
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Lancer le Backtest
            </>
          )}
        </button>

        {/* Progress bar */}
        {loading && (
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertTriangle className="w-4 h-4 inline mr-2" />{error}
          </div>
        )}
      </div>

      {/* ── Right Panel: Results ─────────────────────────────────────────── */}
      <div className="lg:col-span-8 space-y-5">

        {!result && !loading && (
          <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-5 min-h-[400px]">
            <div className="text-6xl">📊</div>
            <div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Simulateur de Backtesting Interactif</h3>
              <p className="text-slate-400 text-sm max-w-md">
                Configurez vos paramètres et lancez une simulation pour voir comment DreamSentinel AI aurait performé sur des marchés DreamDEX historiques.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
              <span className="px-3 py-1 rounded-full bg-slate-800">🧠 Moteur Bayésien</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">📐 Kelly Criterion</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">📈 Courbe d'Équité</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">🔍 Journal de Trades</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center gap-5 min-h-[400px]">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-slate-200 font-bold">Simulation en cours…</p>
              <p className="text-slate-500 text-xs mt-1">Analyse bayésienne sur {days} jours × {tradesPerDay} trades/jour</p>
            </div>
          </div>
        )}

        {result && (
          <>
            {/* Strategy header */}
            <div className="glass-panel rounded-3xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Stratégie simulée</div>
                  <div className="text-lg font-black text-slate-100">{result.strategy_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{days} jours • {result.total_trades} trades exécutés</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{result.total_pnl_pct}%
                  </div>
                  <div className="text-xs text-slate-400">
                    ${result.initial_capital.toLocaleString()} → <strong className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>${result.final_capital.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="P&L Total" color={isProfit ? 'emerald' : 'rose'}
                value={`${isProfit ? '+' : ''}$${result.total_pnl.toFixed(0)}`}
                sub={`${isProfit ? '+' : ''}${result.total_pnl_pct}% de rendement`}
              />
              <StatCard
                label="Win Rate" color={result.win_rate_pct >= 55 ? 'emerald' : 'amber'}
                value={`${result.win_rate_pct}%`}
                sub={`${result.winning_trades}W / ${result.losing_trades}L`}
              />
              <StatCard
                label="Sharpe Ratio" color={result.sharpe_ratio >= 1.5 ? 'violet' : 'amber'}
                value={result.sharpe_ratio.toFixed(2)}
                sub={result.sharpe_ratio >= 2 ? '🏆 Excellent' : result.sharpe_ratio >= 1 ? '✅ Bon' : '⚠️ Faible'}
              />
              <StatCard
                label="Max Drawdown" color={result.max_drawdown_pct < 10 ? 'emerald' : result.max_drawdown_pct < 20 ? 'amber' : 'rose'}
                value={`-${result.max_drawdown_pct}%`}
                sub="Perte maximale sur pic"
              />
              <StatCard
                label="Trades Totaux" color="cyan"
                value={`${result.total_trades}`}
                sub={`Filtrés sur ${days * tradesPerDay} opportunités`}
              />
              <StatCard
                label="Capital Final" color="cyan"
                value={`$${result.final_capital.toLocaleString()}`}
                sub={`Initial: $${result.initial_capital.toLocaleString()}`}
              />
            </div>

            {/* Chart / Trade log toggle */}
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="flex items-center gap-1 p-3 border-b border-slate-800">
                <button
                  onClick={() => setActiveView('chart')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeView === 'chart' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />Courbe d'Équité
                </button>
                <button
                  onClick={() => setActiveView('trades')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeView === 'trades' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <List className="w-3.5 h-3.5" />Journal de Trades
                </button>
              </div>

              {activeView === 'chart' && (
                <div style={{ height: '280px' }} className="p-1">
                  <EquityChart curve={result.equity_curve} initialCapital={result.initial_capital} />
                </div>
              )}

              {activeView === 'trades' && (
                <div className="overflow-auto max-h-72">
                  <table className="w-full text-[11px] font-mono">
                    <thead className="sticky top-0 bg-slate-900/90 text-slate-400">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Marché</th>
                        <th className="px-3 py-2 text-left">Side</th>
                        <th className="px-3 py-2 text-right">Prix</th>
                        <th className="px-3 py-2 text-right">Edge</th>
                        <th className="px-3 py-2 text-right">Mise</th>
                        <th className="px-3 py-2 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.slice().reverse().map((t, i) => (
                        <tr key={t.trade_id} className={`border-t border-slate-800/40 ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                          <td className="px-3 py-1.5 text-slate-500">{t.trade_id}</td>
                          <td className="px-3 py-1.5 text-slate-300">{t.market_symbol}</td>
                          <td className="px-3 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.outcome === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {t.outcome}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-right text-slate-300">${t.entry_price.toFixed(2)}</td>
                          <td className="px-3 py-1.5 text-right text-cyan-400">+{(t.edge * 100).toFixed(1)}%</td>
                          <td className="px-3 py-1.5 text-right text-slate-300">${t.amount_usdso.toFixed(0)}</td>
                          <td className={`px-3 py-1.5 text-right font-bold ${t.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.result === 'WIN' ? '+' : ''}{t.pnl_usdso.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setProgress(0); }}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />Réinitialiser les résultats
            </button>
          </>
        )}
      </div>
    </div>
  );
}
