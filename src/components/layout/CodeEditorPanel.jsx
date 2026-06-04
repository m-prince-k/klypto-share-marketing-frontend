import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { IoCloseSharp } from "react-icons/io5";
import { FaPlay, FaTrash } from "react-icons/fa";

const CodeEditorPanel = ({
  onClose,
  onDeploy,
  onClear,
  onEdit,
  editorCode,
  setEditorCode,
  isDeployed,
}) => {
  const debounceRef = useRef(null);

  const handleChange = (value) => {
    setEditorCode(value || "");

    // Call onEdit to reset deployed state
    if (onEdit) onEdit();

    // Remove automatic debounced deploy per user request (they want explicit button clicks now to toggle Deploy/Clear)
  };

  return (
    <div
      style={{
        width: "400px",
        borderLeft: "1px solid #2a2e39",
        display: "flex",
        flexDirection: "column",
        background: "#131722",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #2a2e39",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontWeight: 600, fontSize: "0.95rem", color: "#d1d4dc" }}
        >
          Code Editor
        </span>
        <IoCloseSharp
          style={{ cursor: "pointer", color: "#787b86", fontSize: "1.2rem" }}
          onClick={onClose}
        />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={editorCode}
          onChange={handleChange}
          options={{ minimap: { enabled: false } }}
        />
      </div>
      <div
        style={{
          padding: "12px 12px 14px",
          borderTop: "1px solid #2a2e39",
          background: "linear-gradient(180deg, #1a1e2b 0%, #1e222d 100%)",
        }}
      >
        {isDeployed ? (
          <button
            onClick={onClear}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "transparent",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.04em",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "7px",
              transition: "all 0.15s ease",
              boxShadow: "0 0 0 0 rgba(239,68,68,0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.7)";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(239,68,68,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
              e.currentTarget.style.boxShadow = "0 0 0 0 rgba(239,68,68,0)";
            }}
          >
            <FaTrash size={11} />
            Clear
          </button>
        ) : (
          <button
            onClick={() => onDeploy(editorCode)}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "linear-gradient(135deg, #2962ff 0%, #1a4fd6 100%)",
              color: "#fff",
              border: "1px solid rgba(41,98,255,0.6)",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.04em",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "7px",
              transition: "all 0.15s ease",
              boxShadow:
                "0 2px 12px rgba(41,98,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #3d74ff 0%, #2962ff 100%)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(41,98,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #2962ff 0%, #1a4fd6 100%)";
              e.currentTarget.style.boxShadow =
                "0 2px 12px rgba(41,98,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <FaPlay size={11} />
            Deploy
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPanel;
