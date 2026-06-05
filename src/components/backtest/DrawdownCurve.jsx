import React, { useEffect, useRef } from "react";
import { AreaSeries, createChart } from "lightweight-charts";

const DrawdownCurve = ({ drawdownData }) => {
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
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
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

    const areaSeries = chart.addSeries(AreaSeries,{
      topColor: 'rgba(242, 54, 69, 0.4)',
      bottomColor: 'rgba(242, 54, 69, 0)',
      lineColor: '#f23645',
      lineWidth: 2,
    });
    areaSeries.setData(drawdownData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [drawdownData]);

  return (
    <div className="drawdown-curve-container">
      <div className="dd-header">
        <span className="dd-title">Drawdown Curve <span className="info-icon">ⓘ</span></span>
      </div>
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: '150px' }} />

      <style>{`
        .drawdown-curve-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .dd-header {
          margin-bottom: 12px;
        }
        .dd-title {
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

export default DrawdownCurve;
