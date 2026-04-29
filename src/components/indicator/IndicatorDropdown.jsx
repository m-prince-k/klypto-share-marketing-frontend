import { useState, useRef, useEffect } from "react";

export default function IndicatorDropdown({ activeIndicators, toggleIndicator }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const indicators = ["SMA", "EMA", "BB", "RSI", "VWAP"];
    

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
      
      {/* Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          padding: "6px 12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Indicators ▾
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            zIndex: 999,
            minWidth: "140px",
          }}
        >
          {indicators.map((ind) => (
            <label
              key={ind}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={activeIndicators[ind] || false}
                onChange={() => toggleIndicator(ind)}
              />
              {ind}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}