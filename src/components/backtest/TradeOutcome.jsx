import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const TradeOutcome = ({ data }) => {
  const chartData = {
    labels: ["Winning Trades", "Losing Trades"],
    datasets: [
      {
        data: [data.winRate.wins, data.winRate.losses],
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

  return (
    <div className="trade-outcome-container">
      <div className="to-header">
        <span className="to-title">Trade Outcome</span>
      </div>
      <div className="to-body">
        <div className="to-chart-wrapper">
          <Doughnut data={chartData} options={options} />
          <div className="to-center-text">
            <span className="to-center-val">{data.totalTrades.value}</span>
            <span className="to-center-lbl">Total Trades</span>
          </div>
        </div>
        <div className="to-legend">
          <div className="to-legend-item">
            <span className="to-legend-color" style={{ background: "#089981" }}></span>
            <div className="to-legend-text">
              <span className="to-lbl">Winning Trades</span>
              <span className="to-val">{data.winRate.wins} ({data.winRate.value}%)</span>
            </div>
          </div>
          <div className="to-legend-item">
            <span className="to-legend-color" style={{ background: "#f23645" }}></span>
            <div className="to-legend-text">
              <span className="to-lbl">Losing Trades</span>
              <span className="to-val">{data.winRate.losses} ({(100 - data.winRate.value).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .trade-outcome-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px;
        }
        .to-header {
          margin-bottom: 12px;
        }
        .to-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
        }
        .to-body {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex: 1;
        }
        .to-chart-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .to-center-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .to-center-val {
          font-size: 16px;
          font-weight: 600;
          color: #d1d4dc;
        }
        .to-center-lbl {
          font-size: 10px;
          color: #787b86;
        }
        .to-legend {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .to-legend-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .to-legend-color {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .to-legend-text {
          display: flex;
          flex-direction: column;
        }
        .to-lbl {
          font-size: 11px;
          color: #d1d4dc;
        }
        .to-val {
          font-size: 11px;
          color: #787b86;
        }
      `}</style>
    </div>
  );
};

export default TradeOutcome;
