import { IoEyeOutline, IoEyeOffOutline, IoSettingsOutline, IoCloseSharp } from "react-icons/io5";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCode } from "react-icons/fa";

export default function IndicatorBar({
  indicator,
  timeframeValue,
  value,
  renderValue,
  indicatorVisibility,
  toggleIndicatorVisibility,
  removeIndicator,
  setActiveBarIndicator,
  setIndicatorProperty,
  setActiveSourceIndicator,
  setShowSourcePanel,
  type,
  indicatorConfigDefault,
  indicatorConfigs
}) {

  // Reconstruct configuration string (e.g., "14 close")
  const cfg = {
    ...(indicatorConfigDefault?.[type] || {}),
    ...(indicatorConfigs?.[indicator] || {}),
  };
  const len = cfg?.length ?? cfg?.baseLen ?? "";
  const src = cfg?.source ?? "";
  const configString = `${len}${src ? " " + src : ""}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        color: "var(--text-primary)",
        padding: "0 10px",
        height: 32,
        fontSize: 12,
        whiteSpace: "nowrap"
        
      }}
    >

      <span className="flex items-center gap-2 text-[var(--text-secondary)]">

        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {type}
        </span>
        {" : "}
        {configString && <span>{configString}</span>}

        <span style={{ display: "flex", gap: 6 }}>
          {renderValue(indicator, value)}
        </span>

      </span>

      <div className="flex items-center gap-2 text-[var(--text-secondary)]">

        <button
          onClick={() => toggleIndicatorVisibility(indicator)}
        >
          {indicatorVisibility[indicator] ?
            <IoEyeOutline size={16} /> :
            <IoEyeOffOutline size={16} />
          }
        </button>

        <button
          onClick={() => {
            setActiveBarIndicator(indicator);
            setIndicatorProperty((prev) => !prev);
          }}
        >
          <IoSettingsOutline size={16} />
        </button>

        <button
          onClick={() => {
            setActiveSourceIndicator(indicator);
            setShowSourcePanel(true);
          }}
        >
          <FaCode size={16} />
        </button>

        <button onClick={() => removeIndicator(indicator)}>
          <IoCloseSharp size={16} />
        </button>

        <FiMoreHorizontal size={16} />

      </div>

    </div>
  );
}