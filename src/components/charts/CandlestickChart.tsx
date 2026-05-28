"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi } from "lightweight-charts";

interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: OHLCData[];
  title?: string;
  height?: number;
}

export function CandlestickChart({ data, title = "BTC/USD", height = 400 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#8b99a8",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(42, 56, 78, 0.3)" },
        horzLines: { color: "rgba(42, 56, 78, 0.3)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255, 145, 0, 0.4)", labelBackgroundColor: "#ff9100" },
        horzLine: { color: "rgba(255, 145, 0, 0.4)", labelBackgroundColor: "#ff9100" },
      },
      rightPriceScale: {
        borderColor: "rgba(42, 56, 78, 0.5)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(42, 56, 78, 0.5)",
        timeVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00d26a",
      downColor: "#ff5252",
      borderUpColor: "#00d26a",
      borderDownColor: "#ff5252",
      wickUpColor: "#00d26a",
      wickDownColor: "#ff5252",
    });

    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700 bg-ink-900">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-ink-50">{title}</h3>
          <span className="text-2xs text-ink-400 font-mono">Daily · OHLC</span>
        </div>
        <span className="text-2xs text-ink-500">lightweight-charts</span>
      </div>
      <div className="bg-ink-950 p-2">
        <div ref={containerRef} />
      </div>
    </div>
  );
}

export const MOCK_BTC_OHLC: OHLCData[] = [
  { time: "2025-01-02", open: 93500, high: 94800, low: 93100, close: 94200 },
  { time: "2025-01-03", open: 94200, high: 95100, low: 93800, close: 94600 },
  { time: "2025-01-06", open: 94600, high: 95500, low: 94000, close: 95200 },
  { time: "2025-01-07", open: 95200, high: 96300, low: 94700, close: 95800 },
  { time: "2025-01-08", open: 95800, high: 96100, low: 94200, close: 94500 },
  { time: "2025-01-09", open: 94500, high: 95400, low: 93600, close: 93900 },
  { time: "2025-01-10", open: 93900, high: 94800, low: 92800, close: 94300 },
  { time: "2025-01-13", open: 94300, high: 95600, low: 93500, close: 95100 },
  { time: "2025-01-14", open: 95100, high: 96800, low: 94800, close: 96500 },
  { time: "2025-01-15", open: 96500, high: 97200, low: 95900, close: 96100 },
  { time: "2025-01-16", open: 96100, high: 97500, low: 95800, close: 97300 },
  { time: "2025-01-17", open: 97300, high: 98100, low: 96200, close: 96800 },
  { time: "2025-01-20", open: 96800, high: 99500, low: 96400, close: 99100 },
  { time: "2025-01-21", open: 99100, high: 101200, low: 98600, close: 100800 },
  { time: "2025-01-22", open: 100800, high: 102500, low: 100200, close: 101900 },
  { time: "2025-01-23", open: 101900, high: 103100, low: 100900, close: 102400 },
  { time: "2025-01-24", open: 102400, high: 104200, low: 101800, close: 103500 },
  { time: "2025-01-27", open: 103500, high: 104800, low: 102200, close: 102600 },
  { time: "2025-01-28", open: 102600, high: 103900, low: 101500, close: 103200 },
  { time: "2025-01-29", open: 103200, high: 105400, low: 103000, close: 104800 },
  { time: "2025-01-30", open: 104800, high: 105200, low: 103300, close: 103600 },
  { time: "2025-01-31", open: 103600, high: 104100, low: 101200, close: 101800 },
  { time: "2025-02-03", open: 101800, high: 102900, low: 100100, close: 100500 },
  { time: "2025-02-04", open: 100500, high: 101800, low: 99200, close: 101200 },
  { time: "2025-02-05", open: 101200, high: 102600, low: 100800, close: 102100 },
  { time: "2025-02-06", open: 102100, high: 103400, low: 101500, close: 102800 },
  { time: "2025-02-07", open: 102800, high: 103200, low: 101000, close: 101500 },
  { time: "2025-02-10", open: 101500, high: 102800, low: 100200, close: 100800 },
  { time: "2025-02-11", open: 100800, high: 101600, low: 99500, close: 99800 },
  { time: "2025-02-12", open: 99800, high: 100900, low: 98800, close: 100400 },
  { time: "2025-02-13", open: 100400, high: 101200, low: 99600, close: 99900 },
  { time: "2025-02-14", open: 99900, high: 100500, low: 97800, close: 98200 },
  { time: "2025-02-17", open: 98200, high: 99100, low: 96500, close: 96900 },
  { time: "2025-02-18", open: 96900, high: 98400, low: 96100, close: 97800 },
  { time: "2025-02-19", open: 97800, high: 98600, low: 96200, close: 96500 },
  { time: "2025-02-20", open: 96500, high: 97200, low: 94800, close: 95200 },
  { time: "2025-02-21", open: 95200, high: 96800, low: 93500, close: 94100 },
  { time: "2025-02-24", open: 94100, high: 95000, low: 91800, close: 92300 },
  { time: "2025-02-25", open: 92300, high: 93500, low: 88200, close: 88900 },
  { time: "2025-02-26", open: 88900, high: 89800, low: 86500, close: 87200 },
  { time: "2025-02-27", open: 87200, high: 88100, low: 84500, close: 85800 },
  { time: "2025-02-28", open: 85800, high: 87200, low: 85000, close: 86400 },
  { time: "2025-03-03", open: 86400, high: 88900, low: 86100, close: 88500 },
  { time: "2025-03-04", open: 88500, high: 89200, low: 84800, close: 85200 },
  { time: "2025-03-05", open: 85200, high: 87100, low: 83500, close: 86800 },
  { time: "2025-03-06", open: 86800, high: 88400, low: 86200, close: 87900 },
  { time: "2025-03-07", open: 87900, high: 88600, low: 84100, close: 84500 },
  { time: "2025-03-10", open: 84500, high: 85800, low: 79200, close: 80100 },
  { time: "2025-03-11", open: 80100, high: 81200, low: 77200, close: 78500 },
  { time: "2025-03-12", open: 78500, high: 82100, low: 78200, close: 81400 },
  { time: "2025-03-13", open: 81400, high: 83200, low: 80500, close: 82600 },
  { time: "2025-03-14", open: 82600, high: 84100, low: 81900, close: 83500 },
  { time: "2025-03-17", open: 83500, high: 84800, low: 82200, close: 83100 },
  { time: "2025-03-18", open: 83100, high: 84500, low: 82800, close: 84200 },
  { time: "2025-03-19", open: 84200, high: 85800, low: 83100, close: 85400 },
  { time: "2025-03-20", open: 85400, high: 86200, low: 84200, close: 84800 },
  { time: "2025-03-21", open: 84800, high: 85500, low: 83500, close: 84100 },
  { time: "2025-03-24", open: 84100, high: 86500, low: 83800, close: 86200 },
  { time: "2025-03-25", open: 86200, high: 87800, low: 85600, close: 87400 },
  { time: "2025-03-26", open: 87400, high: 88200, low: 86500, close: 87100 },
];
