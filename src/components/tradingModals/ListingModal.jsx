import { useState, useEffect, useRef } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { Form, InputGroup, ListGroup } from "react-bootstrap";
import { Spinner } from "./Spinner";
import apiService from "../../services/apiServices";
import { useDebounce } from "../../util/common";
import { getStockLogo } from "../../util/stockSymbol/helper";
import NSE from "../../assets/NSE.svg";
import BSE from "../../assets/BSE.svg";
import { io } from "socket.io-client";
import socket from "../../services/socket";

export const ListingModal = ({
  isOpen,
  onClose,
  title,
  selectedCurrency,
  setSelectedCurrency,
  selectedIndicator,
  setSelectedIndicator,
  toggleIndicator,
  setAlertResult,
  alertResult,
}) => {
  const [indicators, setIndicators] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equityLoading, setEquityLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIndicator, setSearchIndicator] = useState("");
  const [searchCurrency, setSearchCurrency] = useState("");
  const TABS = ["ALL", "EQUITY", "FUTURES", "OPTIONS"];
  const [activeTab, setActiveTab] = useState("ALL");
  const [equity, setEquity] = useState([]);
  const [futures, setFutures] = useState([]);
  const [options, setOptions] = useState([]);
  const [rsiValue, setRsiValue] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState(null);
  const intervalRef = useRef(null);

  // ─── Alert Handler ───────────────────────────────────────────────────────────
  const handleSubmitAlert = () => {
    if (!rsiValue) return;
    setAlertLoading(true);
    setAlertError(null);
    setAlertResult(null);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const fetchRSI = async () => {
      try {
        const res = await apiService.post(
          `equity/rsi-scanner?interval=1d&fromDate=2026-04-01&toDate=2026-05-06`,
          { rsi_threshold: Number(rsiValue) }
        );
        setAlertResult(res?.data || res);
      } catch (err) {
        console.error(err);
        setAlertError("Failed to fetch RSI data");
      } finally {
        setAlertLoading(false);
      }
    };

    fetchRSI();
    intervalRef.current = setInterval(fetchRSI, 200000);
  };

  const debouncedIndicator = useDebounce(searchIndicator, 500);

  // ─── Fetch Indicators ────────────────────────────────────────────────────────
  async function fetchIndicators() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post(`/equity/getIndicators`);
      console.log("indicator API response:", response);
      setIndicators(response?.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch indicators");
    } finally {
      setLoading(false);
    }
  }

  // ─── Socket: Fetch Stocks (Equity) ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || title !== "Symbol Search") return;

    setEquityLoading(true);


    socket.on("connect", () => {
      console.log("Socket connected, emitting getAllStocks");
      socket.emit("getAllStocks");
    });

    socket.on("stocks", (response) => {
      console.log("stocks socket response:", response);
      const stocks = response?.stocks || [];
      console.log("Total stocks received:", stocks.length);
      setCurrencies(stocks);
      setEquity(stocks);       // ✅ bind to equity state
      setEquityLoading(false);
      setLoading(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setError(err.message);
      setEquityLoading(false);
      setLoading(false);
    });

    return () => {
      socket.off("connect");
      socket.off("stocks");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [isOpen, title]);

  // ─── Fetch Futures ───────────────────────────────────────────────────────────
  async function fetchFutures() {
    try {
      setLoading(true);
      const res = await apiService.get("futures/symbols");
      console.log("FUTURES:", res);
      setFutures(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Fetch Options ───────────────────────────────────────────────────────────
  async function fetchOptions() {
    try {
      setLoading(true);
      const res = await apiService.get("equity/options");
      console.log("OPTIONS:", res);
      setOptions(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Tab-based Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    if (title === "Indicators") {
      fetchIndicators();
      return;
    }
    if (title === "Symbol Search") {
      if (activeTab === "ALL") {
        if (futures.length === 0) fetchFutures();
        if (options.length === 0) fetchOptions();
      }
      if (activeTab === "FUTURES" && futures.length === 0) fetchFutures();
      if (activeTab === "OPTIONS" && options.length === 0) fetchOptions();
    }
  }, [title, activeTab]);

  // ─── Normalize ───────────────────────────────────────────────────────────────
  const normalize = (item, type) => {
    if (type === "FUTURES") {
      return {
        name: item?.name,
        symbol: item?.symbol,
        token: item?.token,
        segment: item?.segment,
        userCode: item?.userCode,
        type,
        expiry: item?.expiry,
      };
    }
    // ✅ EQUITY & OPTIONS: use actualSymbol, fallback to symbol if missing
    return {
      name: item?.name,
      symbol: item?.actualSymbol || item?.symbol,
      token: item?.token,
      segment: item?.segment,
      userCode: item?.userCode,
      type,
    };
  };

  const mergedList = [
    ...equity.map((e) => normalize(e, "EQUITY")),
    ...futures.map((f) => normalize(f, "FUTURES")),
    ...options.map((o) => normalize(o, "OPTIONS")),
  ];

  // ─── Active List by Tab ──────────────────────────────────────────────────────
  const getActiveList = () => {
    if (activeTab === "EQUITY") {
      console.log("EQUITY tab — equity.length:", equity.length); // debug
      return equity.map((e) => normalize(e, "EQUITY"));
    }
    if (activeTab === "FUTURES") return futures.map((f) => normalize(f, "FUTURES"));
    if (activeTab === "OPTIONS") return options.map((o) => normalize(o, "OPTIONS"));
    return mergedList;
  };

  // ─── Unified Search Filter ───────────────────────────────────────────────────
  const filteredList = getActiveList()?.filter((item) => {
    if (!searchCurrency) return true;
    const search = searchCurrency.toLowerCase();
    return (
      item?.name?.toLowerCase().includes(search) ||
      item?.symbol?.toLowerCase().includes(search) ||
      item?.segment?.toLowerCase().includes(search) ||
      item?.userCode?.toLowerCase().includes(search)
    );
  });

  // ─── Indicator Filter ────────────────────────────────────────────────────────
  const filteredIndicators = (indicators ?? []).filter((item) => {
    if (!searchIndicator) return true;
    const search = searchIndicator.toLowerCase().trim();
    const label = item?.label?.toLowerCase() || "";
    const slug = item?.slug?.toLowerCase() || "";
    const getInitials = (text) =>
      text
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toLowerCase();
    return (
      label.includes(search) ||
      slug.includes(search) ||
      getInitials(label).includes(search)
    );
  });

  // ─── Per-tab Loading Guard ───────────────────────────────────────────────────
  // ✅ Only show spinner if loading flag is true AND no data yet
  // Prevents getting stuck in loading state if flag never resets
  const isTabLoading = () => {
    if (activeTab === "EQUITY")  return equityLoading && equity.length === 0;
    if (activeTab === "FUTURES") return loading && futures.length === 0;
    if (activeTab === "OPTIONS") return loading && options.length === 0;
    // ALL tab: show spinner only while equity has no data yet
    return equityLoading && equity.length === 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/60">
      <div className="w-full px-5 py-4 max-w-3xl h-[90vh] rounded-md bg-white border border-slate-700 shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-black">{title}</h2>
          <IoCloseSharp
            size={20}
            onClick={onClose}
            className="cursor-pointer text-slate-400"
          />
        </div>

        {/* ═══════════════ SYMBOL SEARCH ═══════════════ */}
        {title === "Symbol Search" && (
          <div className="py-3">

            {/* Tabs */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0",
                marginBottom: "12px",
                borderBottom: "1px solid #2a2e39",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    position: "relative",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #2962ff"
                        : "2px solid white",
                    marginBottom: "-1px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: activeTab === tab ? "600" : "400",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    letterSpacing: "0.03em",
                    color: activeTab === tab ? "#25272bff" : "#6a7187",
                    cursor: "pointer",
                    transition: "color 0.15s ease, border-color 0.15s ease",
                    whiteSpace: "nowrap",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab)
                      e.currentTarget.style.color = "#9598a1";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab)
                      e.currentTarget.style.color = "#6a7187";
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                autoFocus
                placeholder="Search symbol..."
                value={searchCurrency}
                onChange={(e) => setSearchCurrency(e.target.value)}
              />
            </InputGroup>

            {/* Stock List */}
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {isTabLoading() ? (
                <Spinner />
              ) : filteredList?.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredList.map((item, index) => (
                    <ListGroup.Item
                      key={`${item.symbol}-${index}`}
                      action
                      onClick={() => {
                        setSelectedCurrency({
                          symbol: item.symbol,
                          name: item.name,
                          token: item.token,
                          segment: item.segment,
                          type: item.type,
                          userCode: item.userCode,
                        });
                        onClose();
                      }}
                      className="d-flex justify-content-between align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={getStockLogo(item?.userCode)}
                          width={24}
                          height={24}
                          style={{ borderRadius: "50%" }}
                          onError={(e) => {
                            e.target.onerror = null;
                          }}
                        />
                        <div className="text-uppercase fw-medium small">
                          {item?.name} ({item?.symbol})
                          {item?.type === "FUTURES" && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#888",
                                marginLeft: 6,
                              }}
                            >
                              {item.expiry}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-end d-flex gap-2 align-items-center">
                        <small className="text-muted">{item.segment}</small>
                        <img
                          src={
                            item.segment?.toLowerCase() === "nse" ? NSE : BSE
                          }
                          className="rounded-full"
                          alt={item.segment}
                        />
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center text-dark py-3">No Data found</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ INDICATORS ═══════════════ */}
        {title === "Indicators" && (
          <div className="mt-3" style={{ maxHeight: "70vh" }}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                autoFocus
                placeholder="Search indicators"
                value={searchIndicator}
                onChange={(e) => setSearchIndicator(e.target.value)}
              />
            </InputGroup>
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {loading ? (
                <Spinner />
              ) : filteredIndicators.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredIndicators.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Form.Check
                        type="checkbox"
                        label={`${item.label} -- ${item.slug}`}
                        checked={selectedIndicator.includes(item.slug)}
                        onChange={() => toggleIndicator(item.slug)}
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No Data found</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ ALERTS ═══════════════ */}
        {title === "Alerts" && (
          <div className="mt-3" style={{ color: "black" }}>
            <h5>Create RSI Alert</h5>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Enter RSI Threshold (e.g. 70)"
                value={rsiValue}
                onChange={(e) => setRsiValue(e.target.value)}
              />
            </InputGroup>
            <button
              className="btn btn-primary w-100"
              onClick={handleSubmitAlert}
              disabled={alertLoading}
            >
              {alertLoading ? "Scanning..." : "Submit"}
            </button>
            <div
              className="mt-3"
              style={{ maxHeight: "290px", overflowY: "auto" }}
            >
              {alertError && (
                <div className="text-danger small">{alertError}</div>
              )}
              {alertResult && (
                <pre style={{ fontSize: "12px" }}>
                  {JSON.stringify(alertResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};