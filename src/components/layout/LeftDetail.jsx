import React from "react";
import { IoCloseSharp } from "react-icons/io5";

const LeftDetail = ({ onClose, selectedCurrency, detailsList, onRemoveStock, setSelectedCurrency }) => {
  return (
    <div className="h-full flex flex-col bg-[#131722] text-white">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">Details</h3>
        <IoCloseSharp size={20} className="cursor-pointer" onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {detailsList.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No detailed stocks added</p>
        ) : (
          detailsList.map((stock, idx) => (
            <div
              key={idx}
              className={`p-3 bg-slate-900/50 rounded-lg border transition-all ${
                selectedCurrency?.symbol === stock.symbol ? "border-blue-500" : "border-slate-800"
              }`}
              onClick={() => setSelectedCurrency(stock)}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-400">{stock.name || stock.symbol}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStock(stock.symbol);
                  }}
                  className="text-slate-500 hover:text-red-500"
                >
                  <IoCloseSharp size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>LTP: <span className="text-white">{stock.ltp || "--"}</span></div>
                <div>High: <span className="text-green-500">{stock.high || "--"}</span></div>
                <div>Low: <span className="text-red-500">{stock.low || "--"}</span></div>
                <div className="col-span-2 text-slate-500">{stock.segment}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftDetail;
