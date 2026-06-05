import React from "react";

const SummaryCards = ({ data }) => {
  return (
    <div className="summary-cards-container">
      {Object.values(data).map((item, i) => (
        <div key={i} className="summary-card">
          <div className="summary-card-title">
            {item.label} <span className="info-icon">ⓘ</span>
          </div>
          <div
            className="summary-card-value"
            style={{
              color:
                item.isPositive === true
                  ? "#089981"
                  : item.isPositive === false
                  ? "#f23645"
                  : "#d1d4dc",
            }}
          >
            {item.label.includes("Rate") || item.label.includes("Return") || item.label.includes("Drawdown") ? "" : item.value < 0 ? "-" : ""}
            {item.label.includes("Rate") || item.label.includes("Return") || item.label.includes("Drawdown") ? "" : "$"}
            {Math.abs(item.value).toLocaleString("en-US", {
              minimumFractionDigits: Number.isInteger(item.value) ? 0 : 2,
            })}
            {item.label.includes("Rate") || item.label.includes("Return") || item.label.includes("Drawdown") ? "%" : ""}
          </div>
          {item.percentage && (
            <div className="summary-card-sub" style={{ color: "#089981" }}>
              {item.percentage}%
            </div>
          )}
          {item.annualized && (
            <div className="summary-card-sub">
              Annualized {item.annualized}%
            </div>
          )}
          {item.wins !== undefined && (
            <div className="summary-card-sub">
              {item.wins} Wins / {item.losses} Losses
            </div>
          )}
          {item.absolute !== undefined && (
            <div className="summary-card-sub">
              ${item.absolute.toLocaleString("en-US")}
            </div>
          )}
          {!item.percentage && !item.annualized && item.wins === undefined && item.absolute === undefined && (
            <div className="summary-card-sub" style={{ opacity: 0 }}>
              Placeholder
            </div>
          )}
        </div>
      ))}

      <style>{`
        .summary-cards-container {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .summary-card {
          background: #1e222d;
          border: 1px solid #2a2e39;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .summary-card-title {
          font-size: 11px;
          color: #d1d4dc;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .info-icon {
          color: #787b86;
          font-size: 10px;
          cursor: pointer;
        }
        .summary-card-value {
          font-size: 18px;
          font-weight: 600;
        }
        .summary-card-sub {
          font-size: 10px;
          color: #787b86;
        }
      `}</style>
    </div>
  );
};

export default SummaryCards;
