// import { useState, useRef, useEffect } from "react";

// // Replace your <select> with this component:
// export default function zSearchSelect({ stocks, stock, setStock, style }) {
//   const [query, setQuery] = useState("");
//   const [open, setOpen] = useState(false);
//   const [highlighted, setHighlighted] = useState(0);
//   const containerRef = useRef(null);
//   const inputRef = useRef(null);

//   //   console.log("📦 stocks:", stocks);
//   // console.log("🎯 selected stock value:", stock);

//   const selected = stocks.find((s) => s.userCode === stock);
//   const displayValue = selected
//     ? `${selected.name} (${selected.actualSymbol})`
//     : "";

//   const normalizedQuery = query.toLowerCase().trim();

//   const filtered = normalizedQuery
//     ? stocks.filter((s) => {
//         const name = s.name?.toLowerCase() || "";
//         const symbol = s.actualSymbol?.toLowerCase() || "";

//         const match =
//           name.includes(normalizedQuery) || symbol.includes(normalizedQuery);

//         return match;
//       })
//     : stocks;

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setOpen(false);
//         setQuery("");
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleOpen = () => {
//     setOpen(true);
//     setQuery(""); // ✅ show full list
//     setHighlighted(0);
//     setTimeout(() => inputRef.current?.focus(), 0);
//   };
//   const handleSelect = (symbol) => {
//     console.log("✅ selected:", symbol);
//     setStock(symbol);
//     setOpen(false);
//     setQuery("");
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlighted((h) => Math.max(h - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       if (filtered[highlighted])
//         handleSelect(filtered[highlighted].actualSymbol);
//     } else if (e.key === "Escape") {
//       setOpen(false);
//       setQuery("");
//     }
//   };

//   const selectStyle = { ...style, cursor: "pointer", userSelect: "none" };

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         position: "relative",
//         display: "inline-block",
//         width: style?.width || "100%",
//       }}
//     >
//       {/* Trigger — looks exactly like the original <select> */}
//       {!open ? (
//         <div
//           onClick={handleOpen}
//           style={{
//             ...selectStyle,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <span style={{ color: stock ? "inherit" : "#999" }}>
//             {stock ? displayValue : "Select stock"}
//           </span>
//         </div>
//       ) : (
//         /* Search input — same size/style as the trigger */
//         <input
//           ref={inputRef}
//           type="text"
//           value={query}
//           onChange={(e) => {
//             const val = e.target.value;
//             setQuery(val);
//             setHighlighted(0);
//           }}
//           onKeyDown={handleKeyDown}
//           placeholder="Search stock…"
//           style={{
//             ...selectStyle,
//             width: "100%",
//             boxSizing: "border-box",
//           }}
//         />
//       )}

//       {/* Dropdown list */}
//       {open && (
//         <div
//           style={{
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             zIndex: 1000,
//             background: "#fff",
//             border: "1px solid #ccc",
//             borderRadius: 4,
//             maxHeight: 220,
//             overflowY: "auto",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
//             marginTop: 2,
//           }}
//         >
//           {filtered.length === 0 ? (
//             <div
//               style={{
//                 padding: "8px 12px",
//                 fontSize: "0.85rem",
//                 color: "#999",
//               }}
//             >
//               No results
//             </div>
//           ) : (
//             filtered.map((s, i) => (
//               <div
//                 key={i}
//                 onMouseDown={() => handleSelect(s.userCode)}
//                 // onMouseEnter={() => setHighlighted(i)}
//                 style={{
//                   padding: "7px 12px",
//                   fontSize: "0.85rem",
//                   fontWeight: s.userCode === stock ? 700 : 400,
//                   cursor: "pointer",
//                   background: i === highlighted ? "#f0f0f0" : "transparent",
//                   color: "#000",
//                 }}
//               >
//                 {s.name} ({s.userCode})<span className="text-muted"> {s.segment}</span> 
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useRef, useEffect } from "react";

/**
 * SearchSelect
 *
 * Props:
 *   stocks    – array of stock objects from socket
 *   stock     – currently selected stock token (string)  ← key is token
 *   setStock  – (token: string) => void
 *   onSelect  – optional (stockObj: object) => void  ← full object callback
 *   style     – style object to match your <select> look
 *
 * Why token?  Your stock objects vary by category:
 *   OPT/FUT have no userCode — but token is always present and unique.
 */
export default function SearchSelect({ stocks, stock, setStock, onSelect, style }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find selected object by token
  const selected = stocks.find((s) => s.token === stock);

  // Display the human-readable name
  const displayValue = selected?.name ?? selected?.symbol ?? "";

  const normalizedQuery = query.toLowerCase().trim();

  const filtered = normalizedQuery
    ? stocks.filter((s) => {
        const name   = (s.name   || "").toLowerCase();
        const symbol = (s.symbol || "").toLowerCase();
        const ucode  = (s.userCode     || "").toLowerCase();
        const actual = (s.actualSymbol || "").toLowerCase();
        return (
          name.includes(normalizedQuery)   ||
          symbol.includes(normalizedQuery) ||
          ucode.includes(normalizedQuery)  ||
          actual.includes(normalizedQuery)
        );
      })
    : stocks;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setHighlighted(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (stockObj) => {
    console.log("✅ SearchSelect selected:", stockObj);
    // Store token as the key — always present, works for OPT/FUT/EQ/IDX
    setStock(stockObj.token);
    if (onSelect) onSelect(stockObj);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) handleSelect(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  const selectStyle = { ...style, cursor: "pointer", userSelect: "none" };

  const categoryColor = (cat) => {
    switch (cat) {
      case "IDX": return { bg: "#312e81", text: "#a5b4fc" };
      case "EQ":  return { bg: "#064e3b", text: "#6ee7b7" };
      case "FUT": return { bg: "#78350f", text: "#fcd34d" };
      case "OPT": return { bg: "#1e3a5f", text: "#93c5fd" };
      default:    return { bg: "#1f2937", text: "#9ca3af" };
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block", width: style?.width || "100%" }}
    >
      {/* Trigger / Search input */}
      {!open ? (
        <div
          onClick={handleOpen}
          style={{
            ...selectStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{
            color: displayValue ? "inherit" : "#6b7280",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {displayValue || "Select stock"}
          </span>
          <span style={{ fontSize: "0.65rem", color: "#6b7280", flexShrink: 0 }}>▼</span>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
          onKeyDown={handleKeyDown}
          placeholder="Search by name or symbol…"
          style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}
        />
      )}

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000,
          background: "#111827", border: "1px solid #374151", borderRadius: 6,
          maxHeight: 260, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", marginTop: 3,
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px 12px", fontSize: "0.82rem", color: "#6b7280" }}>
              No results found
            </div>
          ) : (
            filtered.map((s, i) => {
              const cat      = categoryColor(s.category);
              const isActive = s.token === stock;
              return (
                <div
                  key={s.token ?? i}
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setHighlighted(i)}
                  style={{
                    padding: "8px 12px", cursor: "pointer",
                    background: i === highlighted ? "#1f2937" : isActive ? "#0f2820" : "transparent",
                    borderLeft: isActive ? "2px solid #10b981" : "2px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.83rem", fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#10b981" : "#f3f4f6",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {s.name || s.symbol}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 1 }}>
                      {s.symbol || s.userCode || ""}
                      {s.token ? ` · ${s.token}` : ""}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.06em",
                    background: cat.bg, color: cat.text,
                    padding: "2px 6px", borderRadius: 4, flexShrink: 0,
                  }}>
                    {s.category || s.segment || "—"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}