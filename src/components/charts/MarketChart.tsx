"use client";

import { CandlestickChart, MOCK_BTC_OHLC } from "./CandlestickChart";

export function MarketChart() {
  return <CandlestickChart data={MOCK_BTC_OHLC} title="BTC / USD" height={400} />;
}
