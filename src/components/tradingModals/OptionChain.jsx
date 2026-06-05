import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.11:3000";
const METADATA_URL = "http://192.168.1.11:3000/api/historical-metadata";

const OptionChain = () => {
  const navigate = useNavigate();

  // ── Dropdown state ──
  const [liveContractsList, setLiveContractsList] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [expiriesList, setExpiriesList] = useState([]);
  const [activeExpiry, setActiveExpiry] = useState("");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Chart state ──
  const [spotPrice, setSpotPrice] = useState(null);
  const [spotChange, setSpotChange] = useState(null);
  const [atmStrike, setAtmStrike] = useState(null);
  const [strikes, setStrikes] = useState([]);
  const [pcr, setPcr] = useState(null);
  const prevSpotRef = useRef(null);
  const autoRefreshRef = useRef(true);

  // ── Hover state ──
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // ── Socket ──
  const [localSocket, setLocalSocket] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch metadata from REST API
  useEffect(() => {
    axios.get(METADATA_URL)
      .then((res) => {
        const data = res.data;
        console.log("[OptionChain] historical-metadata response:", data);
        if (data.success) {
          setMetadata(data.metadata || {});
          // Default selection is now handled by live-options-list
        }
      })
      .catch((err) => console.error("[OptionChain] Failed to fetch metadata:", err));
  }, []);

  // When symbol changes, update expiries from metadata
  useEffect(() => {
    if (!selectedSymbol || !metadata[selectedSymbol]) return;
    const expiries = metadata[selectedSymbol]?.expiries || [];
    setExpiriesList(expiries);
    
    // Only set a default expiry if the current active expiry isn't valid for this symbol
    setActiveExpiry((current) => {
      if (!current || !expiries.includes(current)) {
        return expiries[0] || "";
      }
      return current;
    });

    // Reset chain on symbol change
    setStrikes([]);
    setSpotPrice(null);
    setAtmStrike(null);
  }, [selectedSymbol, metadata]);

  // Socket setup (one persistent connection)
  useEffect(() => {
    const s = io(SOCKET_URL);
    setLocalSocket(s);
    s.on("connect", () => console.log("[OptionChain] Socket connected"));
    s.on("disconnect", () => console.log("[OptionChain] Socket disconnected"));

    // Listen for live-options-list to update symbol dropdown
    s.on("live-options-list", (response) => {
      console.log("[OptionChain] live-options-list received:", response);
      if (Array.isArray(response?.data) && response.data.length > 0) {
        setLiveContractsList(response.data);
        
        // Auto-select first contract if none is selected
        setSelectedContract((prev) => {
          if (!prev) {
            const first = response.data[0];
            setSelectedSymbol(first.symbol);
            setActiveExpiry(first.expiry ?? first.expiry_date);
            setSymbolSearch(first.symbol);
            return first;
          }
          return prev;
        });
      }
    });

    return () => { s.disconnect(); };
  }, []);

  // Subscribe to option-chain-data when symbol/expiry changes
  useEffect(() => {
    if (!localSocket || !selectedSymbol || !activeExpiry) return;

    const subscribe = () => {
      const payload = { symbol: selectedSymbol, expiry_date: activeExpiry };
      console.log("[OptionChain] set-filters:", payload);
      localSocket.emit("set-filters", payload);
    };

    const handleUpdate = (response) => {
      if (!autoRefreshRef.current) return;
      console.log("[OptionChain] option-chain-data received:", response);

      if (response?.symbol && response.symbol !== selectedSymbol) return;

      const chainData = response?.data || response?.chain || [];

      if (response?.spotPrice != null && response.spotPrice !== "") {
        const newSpot = Number(response.spotPrice);
        if (!isNaN(newSpot)) {
          if (prevSpotRef.current != null) {
            setSpotChange(newSpot - Number(prevSpotRef.current));
          }
          prevSpotRef.current = newSpot;
          setSpotPrice(newSpot);
        }
      }
      if (response?.atmStrike != null) setAtmStrike(response.atmStrike);

      if (chainData.length > 0) {
        let finalStrikes = chainData;

        // Group flat array (strike_price + option_type format)
        if (chainData[0]?.strike_price !== undefined && chainData[0]?.option_type !== undefined) {
          const chainMap = {};
          let newAtmSpot = null;
          chainData.forEach((item) => {
            const strike = Number(item.strike_price);
            if (!chainMap[strike]) chainMap[strike] = { strike, ce: null, pe: null };
            if (item.option_type === "CE") chainMap[strike].ce = item;
            else if (item.option_type === "PE") chainMap[strike].pe = item;
            if (item.spot_price) newAtmSpot = Number(item.spot_price);
          });
          finalStrikes = Object.values(chainMap).sort((a, b) => a.strike - b.strike);
          if (newAtmSpot) {
            setSpotPrice(newAtmSpot);
            let closest = null, minDiff = Infinity;
            finalStrikes.forEach((s) => {
              const diff = Math.abs(s.strike - newAtmSpot);
              if (diff < minDiff) { minDiff = diff; closest = s.strike; }
            });
            if (closest) setAtmStrike(closest);
          }
        }

        setStrikes(finalStrikes);
        const totalCallOI = finalStrikes.reduce((sum, row) => sum + (Number(row.ce?.oi || row.call?.oi) || 0), 0);
        const totalPutOI = finalStrikes.reduce((sum, row) => sum + (Number(row.pe?.oi || row.put?.oi) || 0), 0);
        setPcr(totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : null);
      }
    };

    localSocket.on("option-chain-data", handleUpdate);
    if (localSocket.connected) subscribe();
    else localSocket.once("connect", subscribe);

    return () => {
      localSocket.off("option-chain-data", handleUpdate);
      localSocket.off("connect", subscribe);
    };
  }, [localSocket, selectedSymbol, activeExpiry]);

  // ── Helpers ──
  const getStyle = (val) => {
    const n = Number(val);
    if (n > 0) return { color: "#089981" };
    if (n < 0) return { color: "#f23645" };
    return { color: "#d1d4dc" };
  };

  const fmtLtp = (val) => {
    if (val == null || val === "") return "—";
    const n = Number(val);
    return isNaN(n) ? val : `₹${n.toFixed(2)}`;
  };

  const fmtOI = (val) => {
    if (val == null || val === "") return "—";
    const n = Number(val);
    if (isNaN(n)) return val;
    if (n >= 10000000) return (n / 10000000).toFixed(2) + " Cr";
    if (n >= 100000) return (n / 100000).toFixed(2) + " L";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const fmtPct = (val) => {
    if (val == null || val === "") return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  const normalizeSide = (side) => {
    if (!side) return {};
    return {
      ltp: side.ltp ?? side.lastPrice ?? null,
      ltpChgPct: side.ltpChgPct ?? side.pChange ?? side.ltpChange ?? null,
      oi: side.oi ?? side.openInterest ?? null,
      oiChg: side.oiChg ?? side.changeInOI ?? side.oiChange ?? side.oi_change ?? null,
      oiChgPct: side.oiChgPct ?? side.pChangeinOI ?? side.oiChangePct ?? null,
      volume: side.volume ?? side.totalTradedVolume ?? side.vol ?? null,
    };
  };

  const spot = spotPrice ?? atmStrike ?? null;

  const renderOiChng = (oiChg, oiChgPct) => {
    const chg = fmtOI(oiChg);
    const pct = fmtPct(oiChgPct);
    if (chg === "—" && pct == null) return "—";
    return (
      <>
        {chg}
        {pct != null && (
          <span style={getStyle(pct)}> ({pct > 0 ? "+" : ""}{pct.toFixed(2)}%)</span>
        )}
      </>
    );
  };

  const renderLtp = (ltp, ltpChgPct) => {
    const pct = fmtPct(ltpChgPct);
    return (
      <>
        <span style={getStyle(pct ?? 0)}>{fmtLtp(ltp)}</span>
        {pct != null && (
          <span style={{ ...getStyle(pct), fontSize: 11, marginLeft: 4 }}>
            ({pct > 0 ? "+" : ""}{pct.toFixed(2)}%)
          </span>
        )}
      </>
    );
  };

  const handleTrade = (strike, optionType, action, price) => {
    const stockName = `${selectedSymbol} ${activeExpiry} ${strike} ${optionType}`;
    navigate("/dashboard", {
      state: {
        stock: stockName,
        expiry: activeExpiry,
        action: action,
        price: price,
      },
    });
  };

  const filteredContracts = liveContractsList.filter((c) => {
    const search = symbolSearch.toLowerCase();
    return c.symbol?.toLowerCase().includes(search) || 
           (c.strike ?? c.strike_price)?.toString().includes(search) ||
           (c.expiry ?? c.expiry_date)?.toLowerCase().includes(search);
  });

  // ── Render ──
  return (
    <div
      className="w-100 h-100 p-3"
      style={{ background: "#131722", color: "#d1d4dc", overflowY: "auto" }}
    >
      {/* ── Header Controls ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>

        {/* Symbol Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative", minWidth: 260 }}>
          <div
            onClick={() => {
              if (!dropdownOpen) {
                setSymbolSearch(""); // Clear search when opening
                setDropdownOpen(true);
              } else {
                setDropdownOpen(false);
              }
            }}
            style={{
              padding: "6px 12px",
              background: "#1e222d",
              border: "1px solid #2a2e39",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#d1d4dc",
              minWidth: 140,
            }}
          >
            {selectedContract ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 700, color: "#fff" }}>{selectedContract.symbol}</span>
                <span style={{ fontSize: 10, background: "#2a2e39", color: "#d1d4dc", padding: "2px 6px", borderRadius: 4 }}>{selectedContract.exchange ?? "NSE FO"}</span>
                <span style={{ color: "#363a45" }}>|</span>
                <span style={{ color: "#d1d4dc", fontWeight: 500 }}>{selectedContract.expiry} {selectedContract.strike} {selectedContract.option_type}</span>
                <span style={{ color: (selectedContract.change_percentage ?? 0) >= 0 ? "#089981" : "#f23645", fontWeight: 600 }}>
                  {selectedContract.ltp ?? 0} {(selectedContract.change_percentage ?? 0) >= 0 ? "▲" : "▼"}
                </span>
              </div>
            ) : (
              <span>{selectedSymbol || "Select Symbol"}</span>
            )}
            <span style={{ fontSize: 10, color: "#787b86" }}>{dropdownOpen ? "▲" : "▼"}</span>
          </div>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                background: "#1e222d",
                border: "1px solid #2a2e39",
                borderRadius: 6,
                zIndex: 100,
                minWidth: 400,
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "6px 8px", borderBottom: "1px solid #2a2e39" }}>
                <input
                  autoFocus
                  value={symbolSearch}
                  onChange={(e) => setSymbolSearch(e.target.value)}
                  placeholder="Search symbol..."
                  style={{
                    width: "100%",
                    background: "#131722",
                    border: "1px solid #2a2e39",
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 12,
                    color: "#d1d4dc",
                    outline: "none",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {filteredContracts.length === 0 ? (
                  <div style={{ padding: "10px 12px", color: "#787b86", fontSize: 12 }}>
                    {liveContractsList.length === 0 ? "Waiting for live options list..." : "No contracts found"}
                  </div>
                ) : filteredContracts.map((contract, idx) => {
                  const change = contract.change_absolute ?? contract.change ?? contract.netChange ?? 0;
                  const pChange = contract.change_percentage ?? contract.pChange ?? contract.change_percent ?? 0;
                  const isPos = pChange >= 0;
                  const color = isPos ? "#089981" : "#f23645";
                  const exchange = contract.exchange ?? "NFO";
                  const expDate = contract.expiry ?? contract.expiry_date;
                  const strikePrice = contract.strike ?? contract.strike_price;
                  
                  return (
                    <div
                      key={`${contract.symbol}-${expDate}-${strikePrice}-${contract.option_type}-${idx}`}
                      onClick={() => {
                        setSelectedSymbol(contract.symbol);
                        setActiveExpiry(expDate);
                        setSelectedContract(contract);
                        setSymbolSearch(contract.symbol);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #2a2e39",
                        cursor: "pointer",
                        background: selectedSymbol === contract.symbol ? "rgba(8,153,129,0.15)" : "transparent",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = selectedSymbol === contract.symbol ? "rgba(8,153,129,0.15)" : "transparent"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, color: "#d1d4dc" }}>{contract.symbol}</span>
                          <span style={{ fontSize: 9, background: "#2962ff", color: "#fff", padding: "1px 4px", borderRadius: 4 }}>{exchange}</span>
                        </div>
                        <div style={{ fontSize: 11, color }}>
                          {change > 0 ? "+" : ""}{Number(change).toFixed(2)} ({isPos ? "+" : ""}{Number(pChange).toFixed(2)}%)
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#787b86" }}>
                        <span>Exp: <b style={{color: "#d1d4dc"}}>{expDate}</b></span>
                        <span>Strike: <b style={{color: "#d1d4dc"}}>{strikePrice}</b></span>
                        <span style={{ color: contract.option_type === "CE" ? "#089981" : "#f23645", fontWeight: 600 }}>{contract.option_type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Spot Price */}
        {spotPrice != null && (
          <span style={{
            fontSize: 15, fontWeight: 700,
            color: spotChange == null ? "#d1d4dc" : spotChange >= 0 ? "#089981" : "#f23645",
          }}>
            ₹{Number(spotPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            {spotChange != null && (
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>
                ({spotChange >= 0 ? "+" : ""}{spotChange.toFixed(2)})
              </span>
            )}
          </span>
        )}

        {pcr != null && (
          <span style={{ fontSize: 12, color: "#787b86" }}>PCR: <b style={{ color: "#d1d4dc" }}>{pcr}</b></span>
        )}

        {/* Expiry Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
          {expiriesList.map((exp) => (
            <button
              key={exp}
              onClick={() => setActiveExpiry(exp)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #2a2e39",
                background: activeExpiry === exp ? "#089981" : "#1e222d",
                color: activeExpiry === exp ? "#fff" : "#d1d4dc",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: activeExpiry === exp ? 600 : 400,
              }}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #2a2e39" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "center" }}>
          <thead>
            <tr style={{ background: "#1e222d", borderBottom: "1px solid #2a2e39" }}>
              <th colSpan="4" style={{ padding: "12px", borderRight: "1px solid #2a2e39", color: "#089981" }}>CALL</th>
              <th style={{ padding: "12px", borderRight: "1px solid #2a2e39", color: "#d1d4dc" }}>Strike</th>
              <th colSpan="4" style={{ padding: "12px", color: "#f23645" }}>PUT</th>
            </tr>
            <tr style={{ background: "#1e222d", borderBottom: "1px solid #2a2e39", color: "#787b86", fontSize: 11 }}>
              <th style={{ padding: "8px" }}>Volume</th>
              <th style={{ padding: "8px" }}>OI Chng</th>
              <th style={{ padding: "8px" }}>OI</th>
              <th style={{ padding: "8px", borderRight: "1px solid #2a2e39" }}>LTP</th>
              <th style={{ padding: "8px", borderRight: "1px solid #2a2e39" }}>Strike</th>
              <th style={{ padding: "8px" }}>LTP</th>
              <th style={{ padding: "8px" }}>OI</th>
              <th style={{ padding: "8px" }}>OI Chng</th>
              <th style={{ padding: "8px" }}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {strikes.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, color: "#787b86", fontSize: 13 }}>
                  {selectedSymbol ? `Waiting for option chain data for ${selectedSymbol}…` : "Select a symbol to view option chain"}
                </td>
              </tr>
            ) : (
              strikes.map((row, i) => {
                const strike = Number(row.strike);
                const isATM = strike === Number(atmStrike);
                const isCallItm = spot != null && strike < spot;
                const isPutItm = spot != null && strike > spot;
                let callBg = isCallItm ? "rgba(255,235,59,0.05)" : "transparent";
                let putBg = isPutItm ? "rgba(255,235,59,0.05)" : "transparent";
                if (hoveredRow === strike) {
                  callBg = isCallItm ? "rgba(255,235,59,0.12)" : "rgba(255,255,255,0.07)";
                  putBg = isPutItm ? "rgba(255,235,59,0.12)" : "rgba(255,255,255,0.07)";
                }

                const ceProps = {
                  onMouseEnter: () => { setHoveredCell(`${strike}-CE`); setHoveredRow(strike); },
                  onMouseLeave: () => { setHoveredCell(null); setHoveredRow(null); },
                };
                const peProps = {
                  onMouseEnter: () => { setHoveredCell(`${strike}-PE`); setHoveredRow(strike); },
                  onMouseLeave: () => { setHoveredCell(null); setHoveredRow(null); },
                };

                const ce = normalizeSide(row.ce ?? row.call);
                const pe = normalizeSide(row.pe ?? row.put);

                const BsButtons = ({ optType, ltp }) => (
                  <div style={{
                    position: "absolute",
                    right: optType === "CE" ? "4px" : undefined,
                    left: optType === "PE" ? "4px" : undefined,
                    top: "50%", transform: "translateY(-50%)",
                    display: "flex", gap: "4px",
                    background: "#1e222d", padding: "4px",
                    borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.6)", zIndex: 10,
                  }}>
                    <button
                      onClick={() => handleTrade(strike, optType, "BUY", ltp)}
                      style={{ background: "#45c4aa", color: "#131722", fontWeight: "700", border: "none", padding: "2px 7px", borderRadius: "3px", fontSize: "11px", cursor: "pointer" }}
                    >B</button>
                    <button
                      onClick={() => handleTrade(strike, optType, "SELL", ltp)}
                      style={{ background: "#ff646d", color: "#131722", fontWeight: "700", border: "none", padding: "2px 7px", borderRadius: "3px", fontSize: "11px", cursor: "pointer" }}
                    >S</button>
                  </div>
                );

                const strikeCell = (
                  <td
                    onMouseEnter={() => setHoveredRow(strike)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      padding: "10px", fontWeight: "bold",
                      borderRight: "1px solid #2a2e39",
                      background: isATM ? "#0e2a22" : "#1e222d",
                      color: isATM ? "#089981" : "#d1d4dc",
                    }}
                  >
                    {isATM && spot != null ? (
                      <span style={{ background: "#089981", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                        {Number(spot).toFixed(2)}
                      </span>
                    ) : strike.toLocaleString("en-IN")}
                  </td>
                );

                return (
                  <tr
                    key={`${strike}-${i}`}
                    style={{
                      borderBottom: "1px solid #2a2e39",
                      borderTop: isATM ? "2px solid #089981" : undefined,
                    }}
                  >
                    {/* CALL SIDE */}
                    <td {...ceProps} style={{ padding: "10px", background: callBg }}>{fmtOI(ce.volume)}</td>
                    <td {...ceProps} style={{ padding: "10px", background: callBg }}>{renderOiChng(ce.oiChg, ce.oiChgPct)}</td>
                    <td {...ceProps} style={{ padding: "10px", background: callBg, color: "#f23645" }}>{fmtOI(ce.oi)}</td>
                    <td
                      {...ceProps}
                      style={{ padding: "10px", background: callBg, borderRight: "1px solid #2a2e39", position: "relative" }}
                    >
                      {renderLtp(ce.ltp, ce.ltpChgPct)}
                      {hoveredCell === `${strike}-CE` && <BsButtons optType="CE" ltp={ce.ltp} />}
                    </td>

                    {/* STRIKE */}
                    {strikeCell}

                    {/* PUT SIDE */}
                    <td
                      {...peProps}
                      style={{ padding: "10px", background: putBg, position: "relative" }}
                    >
                      {renderLtp(pe.ltp, pe.ltpChgPct)}
                      {hoveredCell === `${strike}-PE` && <BsButtons optType="PE" ltp={pe.ltp} />}
                    </td>
                    <td {...peProps} style={{ padding: "10px", background: putBg, color: "#089981" }}>{fmtOI(pe.oi)}</td>
                    <td {...peProps} style={{ padding: "10px", background: putBg }}>{renderOiChng(pe.oiChg, pe.oiChgPct)}</td>
                    <td {...peProps} style={{ padding: "10px", background: putBg }}>{fmtOI(pe.volume)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionChain;
