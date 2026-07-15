"use client";

import { useRef, useEffect } from "react";
import { createChart, CandlestickSeries, type IChartApi, type UTCTimestamp } from "lightweight-charts";

interface OHLCBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function TerminalChart({
  data,
  height = 380,
}: {
  data: OHLCBar[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length === 0) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#9ca3af",
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(42,56,78,0.25)" },
        horzLines: { color: "rgba(42,56,78,0.25)" },
      },
      crosshair: { mode: 0, vertLine: { color: "#ff9100" }, horzLine: { color: "#ff9100" } },
      rightPriceScale: { borderColor: "rgba(42,56,78,0.4)" },
      timeScale: { borderColor: "rgba(42,56,78,0.4)", timeVisible: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00d26a",
      downColor: "#ff5252",
      wickUpColor: "#00d26a",
      wickDownColor: "#ff5252",
      borderVisible: false,
    });

    const formatted = data.map((b) => ({
      time: b.time as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    series.setData(formatted);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth });
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-ink-900 border border-ink-700" style={{ height }}>
        <span className="text-sm text-ink-500">Chart data unavailable</span>
      </div>
    );
  }

  return <div ref={containerRef} className="rounded-lg bg-ink-900 border border-ink-700" />;
}
