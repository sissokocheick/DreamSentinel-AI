'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CandlestickChartProps {
  symbol: string;
  strikePrice: number;
  currentSpot: number;
  color?: 'cyan' | 'emerald';
}

function generateCandles(basePrice: number, count: number, intervalSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const candles = [];
  let price = basePrice * (0.996 + Math.random() * 0.001);

  for (let i = count; i >= 0; i--) {
    const t = now - i * intervalSeconds;
    const vol = basePrice * 0.0015;
    const open = price;
    const close = open + (Math.random() - 0.48) * vol;
    const high = Math.max(open, close) + Math.random() * vol * 0.5;
    const low = Math.min(open, close) - Math.random() * vol * 0.5;
    price = close;
    candles.push({
      time: t as any,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
  }
  return candles;
}

export function CandlestickChart({ symbol, strikePrice, currentSpot, color = 'cyan' }: CandlestickChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const [lastPrice, setLastPrice] = useState(currentSpot);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    if (!chartRef.current) return;

    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }

      const upColor = color === 'cyan' ? '#06b6d4' : '#10b981';
      const downColor = '#f43f5e';

      // v5 API: createChart returns IChartApi
      const chart = lc.createChart(chartRef.current, {
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#94a3b8',
          fontFamily: "'Inter', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.6)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.6)' },
        },
        crosshair: { mode: lc.CrosshairMode.Normal },
        rightPriceScale: { borderColor: 'rgba(30, 41, 59, 0.6)' },
        timeScale: { borderColor: 'rgba(30, 41, 59, 0.6)', timeVisible: true, secondsVisible: false },
        handleScroll: true,
        handleScale: true,
      });
      chartInstance.current = chart;

      // v5: use addSeries with CandlestickSeries type
      const candleSeries = chart.addSeries(lc.CandlestickSeries, {
        upColor,
        downColor,
        borderVisible: false,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });
      candleSeriesRef.current = candleSeries;

      const candles = generateCandles(currentSpot, 80, 30);
      candleSeries.setData(candles);

      // Strike price line
      candleSeries.createPriceLine({
        price: strikePrice,
        color: '#f59e0b',
        lineWidth: 1,
        lineStyle: lc.LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Strike $${strikePrice.toLocaleString()}`,
      });

      // Volume histogram
      const volumeSeries = chart.addSeries(lc.HistogramSeries, {
        color: `${upColor}40`,
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      volumeSeries.setData(
        candles.map(c => ({
          time: c.time,
          value: Math.random() * 50000 + 10000,
          color: c.close >= c.open ? `${upColor}60` : `${downColor}60`,
        }))
      );

      chart.timeScale().fitContent();
    });

    return () => {
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }
    };
  }, [symbol, strikePrice, color]);

  // Live tick update
  useEffect(() => {
    const interval = setInterval(() => {
      if (!candleSeriesRef.current) return;
      const now = Math.floor(Date.now() / 1000);
      const delta = (Math.random() - 0.49) * currentSpot * 0.0008;
      const newPrice = parseFloat((lastPrice + delta).toFixed(2));
      const slotTime = Math.floor(now / 30) * 30;

      candleSeriesRef.current.update({
        time: slotTime as any,
        open: lastPrice,
        high: Math.max(lastPrice, newPrice) + Math.random() * 2,
        low: Math.min(lastPrice, newPrice) - Math.random() * 2,
        close: newPrice,
      });

      setPriceChange(parseFloat(((newPrice - currentSpot) / currentSpot * 100).toFixed(3)));
      setLastPrice(newPrice);
    }, 1200);
    return () => clearInterval(interval);
  }, [lastPrice, currentSpot]);

  // Resize observer
  useEffect(() => {
    if (!chartRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        chartInstance.current?.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  const isUp = priceChange >= 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-mono font-black text-xl text-slate-100">
            ${lastPrice.toLocaleString()}
          </span>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isUp ? '+' : ''}{priceChange}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Strike: <strong className="text-amber-400">${strikePrice.toLocaleString()}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Somnia L1 • 30s candles</span>
        </div>
      </div>
      <div ref={chartRef} className="flex-1 w-full min-h-0" />
    </div>
  );
}
