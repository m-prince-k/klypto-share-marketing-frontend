import React, { useEffect, useRef } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";

export default function Chart() {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: 1000,
      height: 600,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries);

    // ✅ Proper OHLC data
    candleSeries.setData([
      { time: "2019-04-11", open: 80, high: 85, low: 75, close: 82 },
      { time: "2019-04-12", open: 82, high: 90, low: 78, close: 88 },
      { time: "2019-04-13", open: 88, high: 92, low: 84, close: 86 },
      { time: "2019-04-14", open: 86, high: 89, low: 80, close: 81 },
      { time: "2019-04-15", open: 81, high: 84, low: 76, close: 78 },
      { time: "2019-04-16", open: 78, high: 83, low: 74, close: 80 },
      { time: "2019-04-17", open: 80, high: 95, low: 79, close: 92 },
      { time: "2019-04-18", open: 92, high: 96, low: 85, close: 87 },
      { time: "2019-04-19", open: 87, high: 90, low: 82, close: 85 },
      { time: "2019-04-20", open: 85, high: 88, low: 80, close: 82 },
    ]);

    // Fit content nicely
    chart.timeScale().fitContent();

    // Cleanup
    return () => chart.remove();
  }, []);

  return <div ref={chartContainerRef} />;
}