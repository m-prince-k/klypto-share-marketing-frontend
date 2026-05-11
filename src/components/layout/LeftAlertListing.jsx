import React from "react";
import { IoCloseSharp } from "react-icons/io5";

const LeftAlertListing = ({ onClose, alertResult, setSelectedCurrency, setActiveTab }) => {
  return (
    <div className="h-full flex flex-col bg-[#131722] text-white">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">RSI Alerts</h3>
        <IoCloseSharp size={20} className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alertResult.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No alerts triggered yet</p>
        ) : (
          alertResult.map((alert, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-blue-500 cursor-pointer transition-all"
              onClick={() => {
                setSelectedCurrency({
                  symbol: alert.symbol,
                  name: alert.name || alert.symbol,
                  token: alert.token,
                  segment: alert.segment || "NSE"
                });
                setActiveTab("Chart");
              }}
            >
              <div className="flex justify-between">
                <span className="font-bold text-blue-400">{alert.name || alert.symbol}</span>
                <span className="text-xs text-slate-500">{alert.segment}</span>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span>RSI: <span className={alert.rsi > 70 ? "text-red-500" : "text-green-500"}>{alert.rsi}</span></span>
                <span>LTP: {alert.ltp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftAlertListing;
