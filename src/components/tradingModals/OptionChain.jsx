import React from "react";

const mockOptionData = [
  {
    strike: 7150,
    call: { volume: "0", oiChg: 0, oiChgPct: 0.0, oi: "3,125", ltp: 331.05, ltpChgPct: -2.56 },
    put: { ltp: 198.55, ltpChgPct: -11.66, oi: "7,125", oiChg: -375, oiChgPct: -5.0, volume: "3.5K" },
  },
  {
    strike: 7200,
    call: { volume: "41.87K", oiChg: 8875, oiChgPct: 23.99, oi: "45.9K", ltp: 341.6, ltpChgPct: 9.65 },
    put: { ltp: 212.25, ltpChgPct: -15.17, oi: "50.8K", oiChg: 3750, oiChgPct: 7.98, volume: "62.25K" },
  },
  {
    strike: 7250,
    call: { volume: "26.37K", oiChg: 4750, oiChgPct: 46.34, oi: "15.0K", ltp: 319.2, ltpChgPct: 9.05 },
    put: { ltp: 235.0, ltpChgPct: -11.42, oi: "19.9K", oiChg: -12750, oiChgPct: -39.08, volume: "54K" },
  },
  {
    strike: 7300,
    call: { volume: "2L", oiChg: 1375, oiChgPct: 2.42, oi: "58.3K", ltp: 292.0, ltpChgPct: 10.0 },
    put: { ltp: 254.35, ltpChgPct: -14.0, oi: "50.0K", oiChg: 4250, oiChgPct: 9.29, volume: "70.12K" },
  },
  {
    strike: 7328,
    isSpot: true,
  },
  {
    strike: 7350,
    call: { volume: "1.05L", oiChg: 3000, oiChgPct: 21.24, oi: "17.1K", ltp: 271.6, ltpChgPct: 13.03 },
    put: { ltp: 276.8, ltpChgPct: -14.65, oi: "5.375", oiChg: 375, oiChgPct: 7.5, volume: "3K" },
  },
  {
    strike: 7400,
    call: { volume: "87.5K", oiChg: -3500, oiChgPct: -8.59, oi: "37.3K", ltp: 243.4, ltpChgPct: 11.42 },
    put: { ltp: 309.1, ltpChgPct: -14.85, oi: "20.1K", oiChg: 3625, oiChgPct: 21.97, volume: "10.75K" },
  },
  {
    strike: 7450,
    call: { volume: "3.87K", oiChg: -500, oiChgPct: -5.41, oi: "8,750", ltp: 226.0, ltpChgPct: 13.23 },
    put: { ltp: 399.7, ltpChgPct: 11.8, oi: "1,750", oiChg: 0, oiChgPct: 0.0, volume: "0" },
  },
  {
    strike: 7500,
    call: { volume: "2.03L", oiChg: 10000, oiChgPct: 13.47, oi: "84.3K", ltp: 205.0, ltpChgPct: 12.51 },
    put: { ltp: 365.0, ltpChgPct: -17.41, oi: "16.5K", oiChg: 1750, oiChgPct: 11.86, volume: "7K" },
  },
];

const OptionChain = ({ selectedCurrency }) => {
  const getStyle = (val) => {
    if (val > 0) return { color: "#089981" };
    if (val < 0) return { color: "#f23645" };
    return { color: "#d1d4dc" };
  };

  const getOiStyle = (val) => {
    return { color: "#089981" }; // Based on image, OI values are often green or red based on some other logic, but let's default to standard colors
  };

  return (
    <div className="w-100 h-100 p-3" style={{ background: "#131722", color: "#d1d4dc", overflowY: "auto" }}>
      <h5 className="mb-3">{selectedCurrency?.name || "NIFTY"} Option Chain</h5>
      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2e39" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "center" }}>
          <thead>
            <tr style={{ background: "#1e222d", borderBottom: "1px solid #2a2e39" }}>
              <th colSpan="4" style={{ padding: "12px", borderRight: "1px solid #2a2e39", color: "#d1d4dc" }}>CALL</th>
              <th style={{ padding: "12px", borderRight: "1px solid #2a2e39", color: "#d1d4dc" }}>LTP & OI</th>
              <th colSpan="4" style={{ padding: "12px", color: "#d1d4dc" }}>PUT</th>
            </tr>
            <tr style={{ background: "#1e222d", borderBottom: "1px solid #2a2e39", color: "#787b86", fontSize: "12px" }}>
              <th style={{ padding: "10px" }}>Volume</th>
              <th style={{ padding: "10px" }}>OI Chng.(Chng%)</th>
              <th style={{ padding: "10px" }}>OI</th>
              <th style={{ padding: "10px", borderRight: "1px solid #2a2e39" }}>LTP (LTP Chng%)</th>
              <th style={{ padding: "10px", borderRight: "1px solid #2a2e39" }}>Strike</th>
              <th style={{ padding: "10px" }}>LTP (LTP Chng%)</th>
              <th style={{ padding: "10px" }}>OI</th>
              <th style={{ padding: "10px" }}>OI Chng.(Chng%)</th>
              <th style={{ padding: "10px" }}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {mockOptionData.map((row, i) => {
              if (row.isSpot) {
                return (
                  <tr key={`spot-${i}`} style={{ background: "rgba(8, 153, 129, 0.1)", borderTop: "2px solid #089981", borderBottom: "2px solid #089981" }}>
                    <td colSpan="4" style={{ borderRight: "1px solid #2a2e39" }}></td>
                    <td style={{ padding: "6px", fontWeight: "bold", borderRight: "1px solid #2a2e39", color: "#089981" }}>
                      <span style={{ background: "#089981", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
                        {row.strike.toFixed(2)}
                      </span>
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                );
              }

              // Color backgrounds based on in-the-money / out-of-the-money
              // ITM Call logic: Strike < Spot (7328) -> Light yellow (in light theme) -> we'll use a subtle dark tint
              const isCallItm = row.strike < 7328;
              const isPutItm = row.strike > 7328;

              const callBg = isCallItm ? "rgba(255, 235, 59, 0.05)" : "transparent";
              const putBg = isPutItm ? "rgba(255, 235, 59, 0.05)" : "transparent";

              return (
                <tr key={row.strike} style={{ borderBottom: "1px solid #2a2e39" }}>
                  {/* CALL SIDE */}
                  <td style={{ padding: "12px", background: callBg }}>{row.call.volume}</td>
                  <td style={{ padding: "12px", background: callBg }}>
                    {row.call.oiChg} <span style={getStyle(row.call.oiChgPct)}>({row.call.oiChgPct > 0 ? "+" : ""}{row.call.oiChgPct.toFixed(2)}%)</span>
                  </td>
                  <td style={{ padding: "12px", background: callBg, color: "#f23645" }}>{row.call.oi}</td>
                  <td style={{ padding: "12px", background: callBg, borderRight: "1px solid #2a2e39" }}>
                    <span style={getStyle(row.call.ltpChgPct)}>₹{row.call.ltp.toFixed(2)}</span> <span style={getStyle(row.call.ltpChgPct)}>({row.call.ltpChgPct > 0 ? "+" : ""}{row.call.ltpChgPct.toFixed(2)}%)</span>
                  </td>

                  {/* STRIKE */}
                  <td style={{ padding: "12px", fontWeight: "bold", borderRight: "1px solid #2a2e39", background: "#1e222d" }}>
                    {row.strike}
                  </td>

                  {/* PUT SIDE */}
                  <td style={{ padding: "12px", background: putBg }}>
                    <span style={getStyle(row.put.ltpChgPct)}>₹{row.put.ltp.toFixed(2)}</span> <span style={getStyle(row.put.ltpChgPct)}>({row.put.ltpChgPct > 0 ? "+" : ""}{row.put.ltpChgPct.toFixed(2)}%)</span>
                  </td>
                  <td style={{ padding: "12px", background: putBg, color: "#089981" }}>{row.put.oi}</td>
                  <td style={{ padding: "12px", background: putBg }}>
                    {row.put.oiChg} <span style={getStyle(row.put.oiChgPct)}>({row.put.oiChgPct > 0 ? "+" : ""}{row.put.oiChgPct.toFixed(2)}%)</span>
                  </td>
                  <td style={{ padding: "12px", background: putBg }}>{row.put.volume}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionChain;
