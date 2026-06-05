import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const LongVsShort = ({ data }) => {
  const chartData = {
    labels: ["Long", "Short"],
    datasets: [
      {
        data: [data.long.netPnl, data.short.netPnl],
        backgroundColor: ["#089981", "#f23645"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e222d",
        titleColor: "#d1d4dc",
        bodyColor: "#d1d4dc",
        borderColor: "#2a2e39",
        borderWidth: 1,
      },
    },
  };

  const totalPnL = data.long.netPnl + data.short.netPnl;

  return (
    <div className="long-short-container">
      <div className="ls-header">
        <span className="ls-title">Long vs Short Performance</span>
      </div>
      <div className="ls-body">
        <div className="ls-chart-wrapper">
          <Doughnut data={chartData} options={options} />
          <div className="ls-center-text">
            <span className="ls-center-lbl">Net PnL</span>
            <span className="ls-center-val">${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="ls-legend">
          <div className="ls-legend-item">
            <div className="ls-legend-title">
              <span className="ls-legend-color" style={{ background: "#089981" }}></span> Long
            </div>
            <div className="ls-legend-val" style={{ color: "#089981" }}>
              ${data.long.netPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({data.long.percentage}%)
            </div>
          </div>
          <div className="ls-legend-item">
            <div className="ls-legend-title">
              <span className="ls-legend-color" style={{ background: "#f23645" }}></span> Short
            </div>
            <div className="ls-legend-val" style={{ color: "#089981" }}>
              ${data.short.netPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({data.short.percentage}%)
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .long-short-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .ls-header {
          margin-bottom: 12px;
        }
        .ls-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
        }
        .ls-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          flex: 1;
          gap: 16px;
        }
        .ls-chart-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .ls-center-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ls-center-val {
          font-size: 12px;
          font-weight: 600;
          color: #d1d4dc;
        }
        .ls-center-lbl {
          font-size: 10px;
          color: #787b86;
        }
        .ls-legend {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ls-legend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ls-legend-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #d1d4dc;
        }
        .ls-legend-color {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .ls-legend-val {
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default LongVsShort;
