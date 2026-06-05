import React, { useEffect, useRef } from "react";
import { createChart, HistogramSeries } from "lightweight-charts";

const PnLDistribution = ({ data }) => {
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
    
    // In Lightweight charts, histogram data needs to be sorted by time
    // For a generic distribution, we hack the time axis
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
    <div className="pnl-dist-container">
      <div className="dist-header">
        <span className="dist-title">PnL Distribution <span className="info-icon">ⓘ</span></span>
      </div>
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: '150px' }} />

      <style>{`
        .pnl-dist-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .dist-header {
          margin-bottom: 12px;
        }
        .dist-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .info-icon {
          color: #787b86;
          font-size: 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default PnLDistribution;
