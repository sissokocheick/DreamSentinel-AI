'use client';

import React, { useEffect, useRef } from 'react';

interface DepthChartProps {
  yesBestBid: number;
  yesBestAsk: number;
  noBestBid: number;
  noBestAsk: number;
}

function buildDepth(bestBid: number, bestAsk: number) {
  const bids: { time: any; value: number }[] = [];
  const asks: { time: any; value: number }[] = [];
  let cumBid = 0, cumAsk = 0;

  // 12 bid levels (left side) - use ascending integer times
  for (let i = 12; i >= 1; i--) {
    const p = parseFloat((bestBid - i * 0.01).toFixed(2));
    if (p > 0.01) { cumBid += Math.random() * 15000 + 3000; bids.push({ time: i as any, value: cumBid }); }
  }
  // Spread mid point
  bids.push({ time: 13 as any, value: cumBid });

  // 12 ask levels (right side)
  for (let i = 1; i <= 12; i++) {
    const p = parseFloat((bestAsk + i * 0.01).toFixed(2));
    if (p < 0.99) { cumAsk += Math.random() * 15000 + 3000; asks.push({ time: (13 + i) as any, value: cumAsk }); }
  }

  return { bids, asks };
}

export function DepthChart({ yesBestBid, yesBestAsk, noBestBid, noBestAsk }: DepthChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

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
          vertLines: { color: 'rgba(30, 41, 59, 0.35)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.35)' },
        },
        rightPriceScale: { borderColor: 'rgba(30, 41, 59, 0.6)' },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
      });
      chartInstance.current = chart;

      const { bids, asks } = buildDepth(yesBestBid, yesBestAsk);

      // Bid side (Emerald)
      const bidSeries = chart.addSeries(lc.AreaSeries, {
        topColor: 'rgba(16, 185, 129, 0.4)',
        bottomColor: 'rgba(16, 185, 129, 0.03)',
        lineColor: '#10b981',
        lineWidth: 2,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        priceFormat: { type: 'custom' as any, formatter: (v: number) => `$${Math.round(v / 1000)}k` },
      });
      bidSeries.setData(bids);

      // Ask side (Rose)
      const askSeries = chart.addSeries(lc.AreaSeries, {
        topColor: 'rgba(244, 63, 94, 0.4)',
        bottomColor: 'rgba(244, 63, 94, 0.03)',
        lineColor: '#f43f5e',
        lineWidth: 2,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        priceFormat: { type: 'custom' as any, formatter: (v: number) => `$${Math.round(v / 1000)}k` },
      });
      askSeries.setData(asks);

      chart.timeScale().fitContent();
    });

    return () => {
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }
    };
  }, [yesBestBid, yesBestAsk]);

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

  const midPrice = ((yesBestBid + yesBestAsk) / 2).toFixed(3);
  const spread = ((yesBestAsk - yesBestBid) * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-slate-400">Bids YES : <strong className="text-emerald-400">${yesBestBid.toFixed(2)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            <span className="text-slate-400">Asks YES : <strong className="text-rose-400">${yesBestAsk.toFixed(2)}</strong></span>
          </div>
        </div>
        <span className="text-slate-400 font-mono">
          Mid: <strong className="text-cyan-300">${midPrice}</strong>
          <span className="text-slate-600 mx-1">|</span>
          Spread: <strong className="text-amber-400">{spread}¢</strong>
        </span>
      </div>
      <div ref={chartRef} className="flex-1 w-full min-h-0" />
    </div>
  );
}
