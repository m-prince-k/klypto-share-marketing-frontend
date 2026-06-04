import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart, LineSeries } from "lightweight-charts";
import Editor from "@monaco-editor/react";

export default function PythonChartNotebook() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef([]);

  const [code, setCode] = useState(`import pandas as pd

# Example user code

sma = []

for i in range(len(close)):
    if i < 19:
        sma.append(None)
    else:
        sma.append(sum(close[i-19:i+1]) / 20)

plot("SMA20", sma)
`);

  const candles = [
    { time: 1710000000, open: 64000, high: 64200, low: 63900, close: 64100 },
    { time: 1710086400, open: 64100, high: 64500, low: 64000, close: 64400 },
    { time: 1710172800, open: 64400, high: 64600, low: 64200, close: 64300 },
    { time: 1710259200, open: 64300, high: 64900, low: 64200, close: 64800 },
    { time: 1710345600, open: 64800, high: 65100, low: 64600, close: 65000 },
    { time: 1710432000, open: 65000, high: 65400, low: 64900, close: 65300 },
    { time: 1710518400, open: 65300, high: 65600, low: 65200, close: 65500 },
    { time: 1710604800, open: 65500, high: 65900, low: 65400, close: 65800 },
    { time: 1710691200, open: 65800, high: 66200, low: 65700, close: 66000 },
    { time: 1710777600, open: 66000, high: 66400, low: 65900, close: 66300 },
    { time: 1710864000, open: 66300, high: 66700, low: 66200, close: 66600 },
    { time: 1710950400, open: 66600, high: 66900, low: 66500, close: 66800 },
    { time: 1711036800, open: 66800, high: 67200, low: 66700, close: 67100 },
    { time: 1711123200, open: 67100, high: 67500, low: 67000, close: 67400 },
    { time: 1711209600, open: 67400, high: 67800, low: 67300, close: 67600 },
    { time: 1711296000, open: 67600, high: 68100, low: 67500, close: 68000 },
    { time: 1711382400, open: 68000, high: 68400, low: 67900, close: 68300 },
    { time: 1711468800, open: 68300, high: 68800, low: 68200, close: 68600 },
    { time: 1711555200, open: 68600, high: 69100, low: 68500, close: 68900 },
    { time: 1711641600, open: 68900, high: 69400, low: 68800, close: 69200 },
    { time: 1711728000, open: 69200, high: 69700, low: 69100, close: 69500 },
    { time: 1711814400, open: 69500, high: 70000, low: 69400, close: 69800 },
  ];

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries,{
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData(candles);

    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  const simulateBackendExecution = () => {
    const closes = candles.map((c) => c.close);

    const sma = closes.map((_, index) => {
      if (index < 4) return null;

      const slice = closes.slice(index - 4, index + 1);

      return (
        slice.reduce((sum, value) => sum + value, 0) / slice.length
      );
    });

    return {
      series: [
        {
          name: "SMA 5",
          data: candles
            .map((candle, index) => ({
              time: candle.time,
              value: sma[index],
            }))
            .filter((x) => x.value !== null),
        },
      ],
    };
  };

  const runPython = () => {
    indicatorSeriesRef.current.forEach((series) => {
      chartRef.current.removeSeries(series);
    });

    indicatorSeriesRef.current = [];

    const response = simulateBackendExecution(code);

    console.log("Plotting JSON:", JSON.stringify(response, null, 2));

    response.series.forEach((indicator) => {
      const lineSeries = chartRef.current.addSeries(LineSeries,{
        title: indicator.name,
        lineWidth: 2,
      });

      lineSeries.setData(indicator.data);

      indicatorSeriesRef.current.push(lineSeries);
    });
  };

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        padding: 20,
        color: "white",
      }}
    >
      <h1>Python Notebook + Candlestick Chart</h1>

      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: 500,
          marginBottom: 20,
          border: "1px solid #334155",
          borderRadius: 10,
        }}
      />

      <div
        style={{
          border: "1px solid #334155",
          overflow: "hidden",
          borderRadius: 10,
        }}
      >
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
        />
      </div>

      <button
        onClick={runPython}
        style={{
          marginTop: 15,
          padding: "12px 24px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 16,
          background: "#22c55e",
          color: "#fff",
        }}
      >
        Run Python
      </button>
    </div>
  );
}