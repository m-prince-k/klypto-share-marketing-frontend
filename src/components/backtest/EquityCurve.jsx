import React, { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

const EquityCurve = ({ equityData, benchmarkData }) => {
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

    const equitySeries = chart.addSeries(LineSeries,{
      color: '#089981',
      lineWidth: 2,
      title: 'Equity',
    });
    equitySeries.setData(equityData);

    const benchmarkSeries = chart.addSeries(LineSeries,{
      color: '#787b86',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: 'Buy & Hold Benchmark',
    });
    benchmarkSeries.setData(benchmarkData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [equityData, benchmarkData]);

  return (
    <div className="equity-curve-container">
      <div className="ec-header">
        <span className="ec-title">Equity Curve <span className="info-icon">ⓘ</span></span>
        <div className="ec-legend">
          <span className="legend-item"><span className="legend-color" style={{background: '#089981'}}></span> Equity</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#787b86', height: '2px', width: '12px'}}></span> Buy & Hold Benchmark</span>
        </div>
      </div>
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: '300px' }} />

      <style>{`
        .equity-curve-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .ec-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .ec-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ec-legend {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #d1d4dc;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
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

export default EquityCurve;
