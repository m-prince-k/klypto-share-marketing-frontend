import React from "react";

const RecentTrades = ({ data }) => {
  return (
    <div className="recent-trades-container">
      <div className="rt-header">
        <span className="rt-title">Recent Trades</span>
      </div>
      <div className="rt-table-wrapper">
        <table className="rt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Direction</th>
              <th>Symbol</th>
              <th>Entry Price</th>
              <th>Exit Price</th>
              <th>PnL ($)</th>
              <th>PnL (%)</th>
              <th>Duration</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {data.map((trade) => (
              <tr key={trade.id}>
                <td>{trade.id}</td>
                <td>{trade.entryTime}</td>
                <td>{trade.exitTime}</td>
                <td style={{ color: trade.direction === "Long" ? "#089981" : "#f23645" }}>{trade.direction}</td>
                <td>{trade.symbol}</td>
                <td>{trade.entryPrice.toFixed(2)}</td>
                <td>{trade.exitPrice.toFixed(2)}</td>
                <td style={{ color: trade.pnl >= 0 ? "#089981" : "#f23645" }}>
                  {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                </td>
                <td style={{ color: trade.pnlPct >= 0 ? "#089981" : "#f23645" }}>
                  {trade.pnlPct >= 0 ? "+" : ""}{trade.pnlPct.toFixed(2)}%
                </td>
                <td>{trade.duration}</td>
                <td style={{ color: trade.result === "Win" ? "#089981" : "#f23645" }}>{trade.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .recent-trades-container {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rt-header {
          padding: 12px 16px;
          border-bottom: 1px solid #2a2e39;
        }
        .rt-title {
          font-size: 13px;
          color: #d1d4dc;
          font-weight: 600;
        }
        .rt-table-wrapper {
          overflow-x: auto;
          flex: 1;
        }
        .rt-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .rt-table th {
          font-size: 11px;
          color: #787b86;
          padding: 10px 16px;
          font-weight: 500;
          border-bottom: 1px solid #2a2e39;
        }
        .rt-table td {
          font-size: 11px;
          color: #d1d4dc;
          padding: 10px 16px;
          border-bottom: 1px solid #2a2e39;
        }
        .rt-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default RecentTrades;
