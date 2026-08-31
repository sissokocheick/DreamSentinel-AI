'use client';

import React, { useEffect, useRef } from 'react';

interface ProbabilityChartProps {
  marketId: string;
  aiProbability: number;
  marketProbability: number;
}

function generateProbHistory(aiProb: number, marketProb: number, count: number) {
  const now = Math.floor(Date.now() / 1000);
  const points = [];
  let ai = aiProb * (0.88 + Math.random() * 0.08);
  let market = marketProb * (0.92 + Math.random() * 0.06);

  for (let i = count; i >= 0; i--) {
    ai = Math.max(5, Math.min(95, ai + (Math.random() - 0.47) * 1.2));
    market = Math.max(5, Math.min(95, market + (Math.random() - 0.5) * 0.8));
    points.push({ time: (now - i * 30) as any, ai: parseFloat(ai.toFixed(2)), market: parseFloat(market.toFixed(2)) });
  }
  if (points.length > 0) {
    points[points.length - 1].ai = parseFloat((aiProb * 100).toFixed(2));
    points[points.length - 1].market = parseFloat((marketProb * 100).toFixed(2));
  }
  return points;
}

export function ProbabilityChart({ marketId, aiProbability, marketProbability }: ProbabilityChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const aiSeriesRef = useRef<any>(null);
  const marketSeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }

      const chart = lc.createChart(chartRef.current, {
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#94a3b8',
          fontFamily: "'Inter', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
        },
        rightPriceScale: { borderColor: 'rgba(30, 41, 59, 0.6)' },
        timeScale: { borderColor: 'rgba(30, 41, 59, 0.6)', timeVisible: true },
        handleScroll: false,
        handleScale: false,
      });
      chartInstance.current = chart;

      // AI Bayesian probability area (Cyan fill)
      const aiArea = chart.addSeries(lc.AreaSeries, {
        topColor: 'rgba(6, 182, 212, 0.25)',
        bottomColor: 'rgba(6, 182, 212, 0.02)',
        lineColor: '#06b6d4',
        lineWidth: 2,
        title: 'Modèle IA',
        priceFormat: { type: 'custom' as any, formatter: (v: number) => `${v.toFixed(1)}%` },
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });
      aiSeriesRef.current = aiArea;

      // DreamDEX CLOB implied (Amber dashed line)
      const marketLine = chart.addSeries(lc.LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        lineStyle: lc.LineStyle.Dashed,
        title: 'DreamDEX CLOB',
        priceFormat: { type: 'custom' as any, formatter: (v: number) => `${v.toFixed(1)}%` },
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });
      marketSeriesRef.current = marketLine;

      const history = generateProbHistory(aiProbability, marketProbability, 60);
      aiArea.setData(history.map(p => ({ time: p.time, value: p.ai })));
      marketLine.setData(history.map(p => ({ time: p.time, value: p.market })));

      chart.timeScale().fitContent();
    });

    return () => {
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }
    };
  }, [marketId, aiProbability, marketProbability]);

  // Live updater
  useEffect(() => {
    const interval = setInterval(() => {
      if (!aiSeriesRef.current || !marketSeriesRef.current) return;
      const slotTime = Math.floor(Date.now() / 1000 / 30) * 30;
      aiSeriesRef.current.update({ time: slotTime as any, value: parseFloat((aiProbability * 100 + (Math.random() - 0.5) * 1.2).toFixed(2)) });
      marketSeriesRef.current.update({ time: slotTime as any, value: parseFloat((marketProbability * 100 + (Math.random() - 0.5) * 0.6).toFixed(2)) });
    }, 2000);
    return () => clearInterval(interval);
  }, [aiProbability, marketProbability]);

  // Resize
  useEffect(() => {
    if (!chartRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        chartInstance.current?.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  const edge = ((aiProbability - marketProbability) * 100).toFixed(1);
  const isPos = aiProbability > marketProbability;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-400 rounded inline-block" />
            <span className="text-slate-400">IA Bayésien : <strong className="text-cyan-400">{(aiProbability * 100).toFixed(1)}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-amber-400 border-dashed inline-block" />
            <span className="text-slate-400">DreamDEX CLOB : <strong className="text-amber-400">{(marketProbability * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
        <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${isPos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          Edge : {isPos ? '+' : ''}{edge}%
        </span>
      </div>
      <div ref={chartRef} className="flex-1 w-full min-h-0" />
    </div>
  );
}
