import React, { useEffect, useState } from "react";
import apiService from "../../../services/apiServices";
import SearchSelect from "./SearchSelect";
import { s } from "../../../util/common";

const EXPIRIES = [
  "30 MAY 2024 (Weekly)",
  "06 JUN 2024 (Weekly)",
  "27 JUN 2024 (Monthly)",
];
const STRIKES = {
  "Nearest ATM": { ATM: "22,200", ITM: "22,150", OTM: "22,250" },
  "OTM +1": { ATM: "22,250", ITM: "22,200", OTM: "22,300" },
};
const ACTIONS = [
  {
    key: "BUY_CALL",
    label: "Buy Call",
    sub: "▲ Long",
    bg: "#10b981",
    text: "#fff",
  },
  {
    key: "SQ_CALL",
    label: "Sq. Off Call",
    sub: "Exit Long",
    bg: "#1f2937",
    text: "#f3f4f6",
  },
  {
    key: "BUY_PUT",
    label: "Buy Put",
    sub: "▼ Short",
    bg: "#ef4444",
    text: "#fff",
  },
  {
    key: "SQ_PUT",
    label: "Sq. Off Put",
    sub: "Exit Short",
    bg: "#1f2937",
    text: "#f3f4f6",
  },
];

const ACTION_MAP = {
  BUY_CALL: "BUY",
  SQ_CALL: "SELL",
  BUY_PUT: "BUY",
  SQ_PUT: "SELL",
};

// Validation rules in order — first failing field is shown to the user
const getValidationError = ({
  stock,
  expiry,
  strategy,
  preference,
  product,
  orderType,
  qty,
}) => {
  if (!stock) return "Please select a Stock before proceeding.";
  if (!expiry) return "Please select an Expiry date.";
  if (!strategy) return "Please select a Strategy.";
  if (!preference) return "Please select a Preference (ATM / ITM / OTM).";
  if (!product) return "Please select a Product type (MIS / NRML / CNC).";
  if (!orderType) return "Please select an Order Type (MARKET / LIMIT).";
  if (!qty || qty < 1) return "Quantity must be at least 1 lot.";
  return null;
};

const OrderPanel = ({
  stock,
  setStock,
  expiry,
  setExpiry,
  strategy,
  setStrategy,
  preference,
  setPreference,
  product,
  setProduct,
  orderType,
  setOrderType,
  qty,
  setQty,
  validity,
  setValidity,
  action,
  setAction,
}) => {
  const [stocks, setStocks] = useState([]);
  const [validationMsg, setValidationMsg] = useState("");
  const recommendedStrike = STRIKES[strategy]?.[preference] ?? "22,200";

  // console.log("🔍 stock value:", stock);
  // console.log("🔍 stocks sample:", stocks[0]);



  const handlePlaceOrder = (selectedAction) => {
    // Run sequential validation first
    const error = getValidationError({
      stock,
      expiry,
      strategy,
      preference,
      product,
      orderType,
      qty,
    });
    if (error) {
      setValidationMsg(error);
      return;
    }

    setValidationMsg("");
    setAction(selectedAction);

    const selectedStock = stocks.find((st) => st.userCode === stock);
    if (!selectedStock) {
      setValidationMsg("Selected stock not found. Please re-select.");
      return;
    }

    const payload = {
      tradingsymbol: stock,
      symboltoken: selectedStock.token,
      transactiontype: ACTION_MAP[selectedAction],
      ordertype: orderType,
      price: orderType === "MARKET" ? 0 : "600",
      quantity: qty,
    };

    console.log("🚀 FINAL PAYLOAD:", payload);
    // apiService.post("order/place", payload);
  };

  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await apiService.get("equity/stocks");
        setStocks(response?.stocks || []);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
    }
    fetchStocks();
  }, []);

  return (
    <div
      style={{
        color: "#f3f4f6",
        fontFamily: "'DM Sans', sans-serif",
        marginLeft: 10,
      }}
    >
      {/* ── STEP 1: STOCK & EXPIRY ── */}
      <div style={s.sectionTitle}>
        <span style={s.sectionBar}>1</span>Select Stock & Expiry
      </div>
      <div style={s.card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <div>
            <label style={s.label}>Stock</label>
            <SearchSelect
              stocks={stocks}
              stock={stock}
              setStock={(val) => {
                setStock(val);
                setValidationMsg("");
              }}
              style={{ ...s.select, fontSize: "0.85rem", fontWeight: 700 }}
            />
          </div>
          <div>
            <label style={s.label}>Current Price</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1,
                  }}
                >
                  22,178.40
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#10b981",
                    marginTop: 2,
                  }}
                >
                  ▲ +128.75 (0.58%)
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  background: "rgba(16,185,129,0.08)",
                  borderBottom: "2px solid #10b981",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            </div>
          </div>
          <div>
            <label style={s.label}>Expiry</label>
            <select
              style={s.select}
              value={expiry}
              onChange={(e) => {
                setExpiry(e.target.value);
                setValidationMsg("");
              }}
            >
              <option value="">Select expiry</option>
              {EXPIRIES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── STEP 2: AUTO STRIKE ── */}
      <div style={s.sectionTitle}>
        <span style={s.sectionBar}>2</span>Auto Strike Selection
        <span
          style={{
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            background: "#f59e0b22",
            color: "#f59e0b",
            border: "1px solid #f59e0b44",
            borderRadius: 4,
            padding: "2px 7px",
          }}
        >
          SMART MODE
        </span>
      </div>
      <div style={s.card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          <div>
            <label style={s.label}>Strategy</label>
            <select
              style={s.select}
              value={strategy}
              onChange={(e) => {
                setStrategy(e.target.value);
                setValidationMsg("");
              }}
            >
              <option value="">Select strategy</option>
              <option>Nearest ATM</option>
              <option>OTM +1</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Preference</label>
            <select
              style={s.select}
              value={preference}
              onChange={(e) => {
                setPreference(e.target.value);
                setValidationMsg("");
              }}
            >
              <option value="">Select preference</option>
              <option>ATM</option>
              <option>ITM</option>
              <option>OTM</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Recommended Strike</label>
            <div
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8,
                padding: "6px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Strike
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: strategy && preference ? "#10b981" : "#4b5563",
                }}
              >
                {strategy && preference ? recommendedStrike : "—"}
                {strategy && preference && (
                  <span
                    style={{ fontSize: "0.65rem", opacity: 0.5, marginLeft: 4 }}
                  >
                    {preference}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 3: ORDER DETAILS ── */}
      <div style={s.sectionTitle}>
        <span style={s.sectionBar}>3</span>Order Details
      </div>
      <div style={s.card}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 1fr 1.1fr 1fr 0.8fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          <div>
            <label style={s.label}>Product</label>
            <select
              style={s.select}
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                setValidationMsg("");
              }}
            >
              <option value="">Select</option>
              <option>MIS</option>
              <option>NRML</option>
              <option>CNC</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Order Type</label>
            <select
              style={s.select}
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value);
                setValidationMsg("");
              }}
            >
              <option value="">Select</option>
              <option>MARKET</option>
              <option>LIMIT</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Quantity (Lots)</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 32,
                  height: 34,
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "6px 0 0 6px",
                  color: "#f3f4f6",
                  fontSize: "1rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                −
              </button>
              <div
                style={{
                  flex: 1,
                  height: 34,
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderLeft: "none",
                  borderRight: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {qty}{" "}
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#6b7280",
                    marginLeft: 4,
                  }}
                >
                  × 75
                </span>
              </div>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: 32,
                  height: 34,
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0 6px 6px 0",
                  color: "#f3f4f6",
                  fontSize: "1rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#6b7280",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {qty * 75} shares total
            </div>
          </div>
          <div>
            <label style={s.label}>Price</label>
            <input style={s.input} placeholder="Market Price" readOnly />
          </div>
          <div>
            <label style={s.label}>Validity</label>
            <select
              style={s.select}
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
            >
              <option>DAY</option>
              <option>IOC</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── STEP 4: SELECT ACTION ── */}
      <div style={s.sectionTitle}>
        <span style={s.sectionBar}>4</span>Select Action
      </div>

      {/* Validation message */}
      {validationMsg && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            padding: "9px 14px",
            marginBottom: 10,
            fontSize: "0.78rem",
            color: "#f87171",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>⚠</span>
          {validationMsg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 10,
          marginBottom: 4,
        }}
      >
        {ACTIONS.map(({ key, label, sub, bg, text }) => {
          const isSelected = action === key;
          return (
            <button
              key={key}
              onClick={() => handlePlaceOrder(key)}
              style={{
                width: "100%",
                padding: "12px 10px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                transition: "all 0.15s",
                background: isSelected ? bg : `${bg}22`,
                color: isSelected ? text : bg === "#1f2937" ? "#9ca3af" : bg,
                border: isSelected
                  ? "none"
                  : `1px solid ${bg === "#1f2937" ? "#374151" : bg + "55"}`,
                boxShadow:
                  isSelected && bg !== "#1f2937"
                    ? `0 4px 14px ${bg}44`
                    : "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = `${bg}44`;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = `${bg}22`;
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span>{label}</span>
              <span
                style={{ fontSize: "0.6rem", fontWeight: 500, opacity: 0.7 }}
              >
                {sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderPanel;
