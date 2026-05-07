import React, { useState, useMemo, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { BsGrid, BsBell } from "react-icons/bs";
import apiService from "../../services/apiServices";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../../pages/auth/protected";

const Navbar = ({ setSelectedCurrency }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchContainerRef = useRef(null);

  // ✅ Fetch stocks from API on mount
  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const response = await apiService.get("equity/stocks");
        setStocks(response?.stocks || []);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  // ✅ Filter stocks based on search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return stocks.slice(0, 8); // ✅ default 8 shown immediately
    return stocks
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.userCode?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 10);
  }, [searchTerm, stocks]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Badge type from segment
  const getBadgeType = (stock) => {
    const seg = stock.segment?.toUpperCase() || "";
    if (seg.includes("FUT")) return "FUT";
    if (seg.includes("OPT") || stock.strike) return "OPT";
    return "EQ";
  };

  // ✅ Format numbers to Indian locale
  const formatLtp = (ltp) => {
    const num = parseFloat(ltp);
    if (isNaN(num)) return ltp;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const styles = {
    navbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 24px",
      backgroundColor: "#131722",
      borderBottom: "1px solid #2a2e39",
      color: "#d1d4dc",
      height: "60px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    leftSection: { display: "flex", alignItems: "center", gap: "24px" },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "1.2rem",
    },
    logoIcon: { color: "#2962ff", fontSize: "1.5rem" },
    indexData: { display: "flex", flexDirection: "column", fontSize: "0.8rem" },
    indexName: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      fontWeight: "600",
    },
    expiryTag: {
      fontSize: "0.6rem",
      backgroundColor: "rgba(239,83,80,0.1)",
      color: "#ef5350",
      padding: "2px 4px",
      borderRadius: "4px",
    },
    indexValues: { display: "flex", gap: "8px", fontWeight: "500" },

    // Search
    searchContainer: { position: "relative", flex: "0 1 420px" },
    searchForm: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#2a2e39",
      borderRadius: "6px",
      padding: "7px 12px",
      border: "1px solid #3a3e4a",
    },
    searchInput: {
      border: "none",
      backgroundColor: "transparent",
      color: "#d1d4dc",
      outline: "none",
      width: "100%",
      marginLeft: "8px",
      fontSize: "0.9rem",
    },

    // Dropdown
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      backgroundColor: "#1e222d",
      border: "1px solid #2a2e39",
      borderRadius: "8px",
      boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
      zIndex: 1000,
      overflow: "hidden",
      maxHeight: "420px",
      overflowY: "auto",
    },
    dropdownHeader: {
      padding: "8px 14px 6px",
      fontSize: "0.7rem",
      fontWeight: "600",
      color: "#787b86",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      borderBottom: "1px solid #2a2e39",
      position: "sticky",
      top: 0,
      backgroundColor: "#1e222d",
    },
    resultItem: {
      display: "flex",
      alignItems: "center",
      padding: "9px 14px",
      cursor: "pointer",
      gap: "10px",
      borderBottom: "1px solid #23262f",
      transition: "background 0.12s",
    },

    // Badge
    badge: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.58rem",
      fontWeight: "700",
      flexShrink: 0,
      letterSpacing: "0.02em",
    },
    badgeEQ: {
      background: "rgba(41,98,255,0.12)",
      color: "#2962ff",
      border: "1px solid rgba(41,98,255,0.25)",
    },
    badgeFUT: {
      background: "rgba(255,171,0,0.1)",
      color: "#ffab00",
      border: "1px solid rgba(255,171,0,0.22)",
    },
    badgeOPT: {
      background: "rgba(100,181,246,0.1)",
      color: "#64b5f6",
      border: "1px solid rgba(100,181,246,0.22)",
    },

    // Item info
    itemInfo: { flex: 1, minWidth: 0 },
    itemTop: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "#d1d4dc",
    },
    itemSub: {
      fontSize: "0.72rem",
      color: "#787b86",
      marginTop: "2px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    // Tags
    tag: {
      fontSize: "0.6rem",
      padding: "1px 5px",
      borderRadius: "3px",
      fontWeight: "600",
      flexShrink: 0,
    },
    tagNSE: { background: "rgba(78,205,196,0.1)", color: "#4ecdc4" },
    tagBSE: { background: "rgba(150,117,255,0.1)", color: "#9675ff" },
    tagFO: { background: "rgba(255,171,0,0.1)", color: "#ffab00" },
    tagPE: { background: "rgba(239,83,80,0.1)", color: "#ef5350" },
    tagCE: { background: "rgba(38,166,154,0.1)", color: "#26a69a" },

    // Price
    itemPrice: { textAlign: "right", flexShrink: 0 },
    ltp: { fontSize: "0.88rem", fontWeight: "600" },
    priceChange: { fontSize: "0.7rem", marginTop: "2px" },

    // Right section
    rightSection: { display: "flex", alignItems: "center", gap: "20px" },
    navLinks: { display: "flex", gap: "20px", alignItems: "center" },
    navLink: {
      color: "#d1d4dc",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: "500",
      cursor: "pointer",
    },
    navLinkActive: { color: "#2962ff" },
    iconButton: {
      background: "transparent",
      border: "none",
      color: "#d1d4dc",
      cursor: "pointer",
      fontSize: "1.2rem",
      display: "flex",
      alignItems: "center",
      padding: "4px",
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#e0e3eb",
      color: "#131722",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "0.9rem",
      cursor: "pointer",
    },
  };

  // ✅ Resolve tag style by segment string
  const getSegmentTagStyle = (segment = "") => {
    const s = segment.toUpperCase();
    if (s.includes("BSE")) return styles.tagBSE;
    if (s.includes("FO") || s.includes("NFO")) return styles.tagFO;
    return styles.tagNSE;
  };

  return (
    <div style={styles.navbar}>
      {/* Left */}
      <div style={styles.leftSection}>
        <div style={styles.logoContainer}>
          <BsGrid style={styles.logoIcon} />
          <span>Algo</span>
        </div>
        <div style={styles.indexData}>
          <div style={styles.indexName}>
            <span>NIFTY</span>
            <span style={styles.expiryTag}>EXPIRY</span>
          </div>
          <div style={styles.indexValues}>
            <span style={{ color: "#ef5350" }}>24,052.80</span>
            <span style={{ color: "#ef5350" }}>▼ -66.50 (-0.28%)</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer} ref={searchContainerRef}>
        <form
          style={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            setShowRecent(false);
          }}
        >
          <FiSearch color="#787b86" size={15} />
          <input
            style={styles.searchInput}
            placeholder="Search stocks, indices… [Ctrl + S]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowRecent(true)}
          />
          {searchTerm && (
            <span
              onClick={() => setSearchTerm("")}
              style={{
                color: "#787b86",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              ✕
            </span>
          )}
        </form>

        {showRecent && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              {searchTerm ? `Results for "${searchTerm}"` : "Recent"}
            </div>

            {loading ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#787b86",
                  fontSize: "0.85rem",
                }}
              >
                Loading…
              </div>
            ) : filteredStocks.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#787b86",
                  fontSize: "0.85rem",
                }}
              >
                No results found
              </div>
            ) : (
              filteredStocks.map((stock, idx) => {
                const badgeType = getBadgeType(stock);
                const isUp =
                  parseFloat(stock.change) >= 0 ||
                  stock.sentiment === "bullish";
                const color = isUp ? "#26a69a" : "#ef5350";
                const arrow = isUp ? "▲" : "▼";
                const changeVal = stock.change
                  ? `${arrow} ${isUp ? "+" : ""}${stock.change} (${stock.percent_change}%)`
                  : null;

                return (
                  <div
                    key={stock.token || idx}
                    style={styles.resultItem}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2a2e39")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onClick={() => {
                      const type = stock.strike
                        ? "OPTIONS"
                        : stock.segment?.includes("FUT")
                          ? "FUTURES"
                          : "EQUITY";

                      setSelectedCurrency({
                        symbol: stock.actualSymbol || stock.name,
                        name: stock.name,
                        token: stock.token,
                        exchange: stock.segment,
                        type,
                        strike: stock.strike || null,
                        optionType: stock.optionType || null,
                        expiry: stock.expiry || null,
                      });

                      setSearchTerm(stock.name);
                      setShowRecent(false);
                    }}
                  >
                    {/* Badge */}
                    <div
                      style={{
                        ...styles.badge,
                        ...styles[`badge${badgeType}`],
                      }}
                    >
                      {badgeType}
                    </div>

                    {/* Info */}
                    <div style={styles.itemInfo}>
                      <div style={styles.itemTop}>
                        <span>{stock.name}</span>
                        <span
                          style={{
                            ...styles.tag,
                            ...getSegmentTagStyle(stock.segment),
                          }}
                        >
                          {stock.segment}
                        </span>
                        {stock.optionType === "PE" && (
                          <span style={{ ...styles.tag, ...styles.tagPE }}>
                            PE
                          </span>
                        )}
                        {stock.optionType === "CE" && (
                          <span style={{ ...styles.tag, ...styles.tagCE }}>
                            CE
                          </span>
                        )}
                      </div>
                      <div style={styles.itemSub}>
                        {stock.expiry
                          ? `${stock.expiry}${stock.strike ? ` · Strike ${stock.strike}` : ""}`
                          : stock.fullName}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={styles.itemPrice}>
                      <div style={{ ...styles.ltp, color }}>
                        {formatLtp(stock.ltp)}
                      </div>
                      {changeVal && (
                        <div style={{ ...styles.priceChange, color }}>
                          {changeVal}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div style={styles.rightSection}>
        <div style={styles.navLinks}>
          {[
            "Markets",
            "TradeOne",
            "Portfolio",
            "Orders",
            "Positions",
            "Tools",
          ].map((link) => (
            <div
              key={link}
              style={{
                ...styles.navLink,
                ...(link === "TradeOne" ? styles.navLinkActive : {}),
              }}
            >
              {link}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            borderLeft: "1px solid #2a2e39",
            paddingLeft: "20px",
          }}
        >
          <button style={styles.iconButton}>
            <BsBell />
          </button>
          <div style={styles.avatar}>KB</div>

          {/* Auth button */}
          {isAuthenticated ? (
            <button
              style={{ ...styles.iconButton, color: "#ef5350" }}
              title="Logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="18"
                width="18"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          ) : (
            <button
              title="Signup"
              onClick={() => navigate("/signup")}
              style={d.btnPrimary}
            >
              <span>Signup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
