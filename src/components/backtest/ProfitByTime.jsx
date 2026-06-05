import React, { useEffect, useRef } from "react";
import { createChart, HistogramSeries } from "lightweight-charts";

const ProfitByTime = ({ data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      crosshair: {
        mode: 1,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const histogramSeries = chart.addSeries(HistogramSeries,{
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by default
    });
    
    histogramSeries.setData(data);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="profit-time-container">
      <div className="pt-header">
        <span className="pt-title">Profit by Time</span>
      </div>
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: '150px' }} />

      <style>{`
        .profit-time-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .pt-header {
          margin-bottom: 12px;
        }
        .pt-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ProfitByTime;
