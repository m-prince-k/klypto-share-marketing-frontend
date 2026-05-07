import React, { useEffect, useState } from "react";

import io from "socket.io-client";

// :electric_plug: WebSocket connection
// const socket = io("http://192.162.1.5:7000", {
//   transports: ["websocket"],
// });

function App() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // =========================
  // INITIAL API LOAD
  // =========================
  const fetchStocks = async () => {
    try {
      const res = await fetch("http://192.162.1.5:7000/equity/stocks");
      const data = await res.json();

      if (data?.stocks) {
        const unique = data.stocks.filter(
          (v, i, arr) =>
            arr.findIndex(
              (t) => t.token === v.token && t.segment === v.segment
            ) === i
        );

        setStocks(unique);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStocks(); // initial load

    // =========================
    // REALTIME SOCKET LISTENER
    // =========================
//     socket.on("stockUpdate", (updatedStocks) => {
//       if (!updatedStocks) return;

//       const unique = updatedStocks.filter(
//         (v, i, arr) =>
//           arr.findIndex(
//             (t) => t.token === v.token && t.segment === v.segment
//           ) === i
//       );

//       setStocks(unique);
//     });

    return () => {
//       socket.off("stockUpdate");
    };
  }, []);

  // =========================
  // SEARCH FIXED
  // =========================
  const filteredStocks = stocks.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // CLICK STOCK → OVERVIEW API
  // =========================
  const handleStockClick = async (stock) => {
    setSelectedStock(stock);
    setActiveTab("overview");
    setLoadingOverview(true);
    setOverview(null);

    try {
      const res = await fetch(
        `http://192.162.1.5:7000/equity/overview?symbol=${stock.name}&exchange=${stock.segment}`
      );
      const data = await res.json();

      setOverview(data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverview(false);
    }
  };

  return (
    <>
      {/* ================= CSS ================= */}
      <style>{`
        .app {
          display: flex;
          height: 100vh;
          font-family: Arial;
        }

        .left {
          width: 320px;
          border-right: 1px solid #ddd;
          overflow-y: auto;
          background: #fff;
        }

        .right {
          flex: 1;
          padding: 15px;
          background: #F9F9F9;
          overflow-y: auto;
        }

        .row-stock {
          padding: 10px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
        }

        .row-stock:hover {
          background: #F3F3F3;
        }

        .up { color: green; }
        .down { color: red; }

        .tabs button {
          margin-right: 10px;
          padding: 6px 12px;
          border: none;
          background: #eee;
        }

        .tabs .active {
          background: #0D6EFD;
          color: white;
        }

        .cardx {
          background: white;
          padding: 12px;
          margin-top: 10px;
          border-radius: 8px;
          box-shadow: 0 0 4px rgba(0,0,0,0.05);
        }

        .depth {
          display: flex;
          gap: 20px;
        }

        .depth table {
          width: 100%;
          font-size: 13px;
        }

        .buy { color: green; }
        .sell { color: red; }
      `}</style>

      <div className="app">

        {/* ================= LEFT WATCHLIST ================= */}
        <div className="left">

          <div className="p-2 fw-bold">Watchlist (LIVE :red_circle:)</div>

          <div className="p-2">
            <input
              className="form-control"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredStocks.map((s, i) => {
            const isUp = s.sentiment === "bullish";

            return (
              <div
                key={`${s.token}-${s.segment}`}
                className="row-stock"
                onClick={() => handleStockClick(s)}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    <b>{s.name}</b>
                    <div className="text-muted small">{s.segment}</div>
                  </div>

                  <div className="text-end">
                    <div className={isUp ? "up" : "down"}>
                      {s.ltp}
                    </div>
                    <small className={isUp ? "up" : "down"}>
                      {s.change} ({s.percent_change}%)
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="right">

          {!selectedStock ? (
            <h5>Select a stock</h5>
          ) : (
            <>
              <h4>
                {selectedStock.name} ({selectedStock.segment})
              </h4>

              {/* Tabs */}
              <div className="tabs mt-2">
                <button
                  className={activeTab === "chart" ? "active" : ""}
                  onClick={() => setActiveTab("chart")}
                >
                  Chart
                </button>

                <button
                  className={activeTab === "overview" ? "active" : ""}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
              </div>

              {/* ================= CHART ================= */}
              {activeTab === "chart" && (
                <div className="cardx">
                  <h5>Chart</h5>
                  <p>Live chart integration (TradingView later)</p>
                </div>
              )}

              {/* ================= OVERVIEW ================= */}
              {activeTab === "overview" && (
                <div>

                  {loadingOverview ? (
                    <div className="cardx">Loading...</div>
                  ) : overview ? (
                    <>
                      <div className="cardx">
                        <h5>Activity</h5>
                        <div className="row">
                          <div className="col">Open: {overview.activity.open}</div>
                          <div className="col">High: {overview.activity.high}</div>
                          <div className="col">Low: {overview.activity.low}</div>
                          <div className="col">Close: {overview.activity.close}</div>
                        </div>
                      </div>

                      <div className="cardx">
                        <h5>Price Details</h5>
                        <div className="row">
                          <div className="col">Avg: {overview.priceDetails.averagePrice}</div>
                          <div className="col">Volume: {overview.priceDetails.volume}</div>
                          <div className="col">OI: {overview.priceDetails.openInterest}</div>
                        </div>
                      </div>

                      <div className="cardx">
                        <h5>Depth</h5>

                        <div className="depth">

                          <table>
                            <thead><tr><th>BUY</th><th>QTY</th></tr></thead>
                            <tbody>
                              {overview.raw_data.depth.buy.map((b, i) => (
                                <tr key={i} className="buy">
                                  <td>{b.price}</td>
                                  <td>{b.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <table>
                            <thead><tr><th>SELL</th><th>QTY</th></tr></thead>
                            <tbody>
                              {overview.raw_data.depth.sell.map((s, i) => (
                                <tr key={i} className="sell">
                                  <td>{s.price}</td>
                                  <td>{s.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="cardx">No data</div>
                  )}
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </>
  );
}

export default App;