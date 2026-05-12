// --- INPUT EVENTS (Client to Server) ---
export const GET_HISTORICAL_DATA = "getManualHistoricalData"; // Fetch historical candles
export const GET_INDICATOR_DETAILS = "getIndicatorDetails"; // Fetch full indicator series
export const GET_LIVE_INDICATOR = "getLiveIndicatorUpdate"; // Fetch single tick indicator value
export const GET_RSI_SCANNER = "getRsiScanner"; // Trigger manual RSI scan
export const SET_RSI_ALERT = "setRsiAlert"; // Set background monitoring threshold
export const GET_ALL_STOCKS = "getAllStocks"; // Request initial stock list

// --- OUTPUT EVENTS (Server to Client) ---
export const HISTORICAL_DATA_RESPONSE = "historicalDataResponse";
export const HISTORICAL_DATA_ERROR = "historicalDataError";

export const INDICATOR_DETAILS_RESPONSE = "indicatorDetailsResponse";
export const INDICATOR_DETAILS_ERROR = "indicatorDetailsError";

export const LIVE_INDICATOR_RESPONSE = "liveIndicatorResponse";

export const RSI_SCANNER_RESPONSE = "rsiScannerResponse";
export const RSI_SCANNER_ERROR = "rsiScannerError";

export const STOCKS_LIST = "stocks";
export const STOCK_UPDATE = "stockUpdate";
export const LIVE_TICK = "liveTick";

export const GOLD_UPDATE = "goldUpdate";

const SocketEvents = {
    GET_HISTORICAL_DATA,
    GET_INDICATOR_DETAILS,
    GET_LIVE_INDICATOR,
    GET_RSI_SCANNER,
    SET_RSI_ALERT,
    GET_ALL_STOCKS,
    HISTORICAL_DATA_RESPONSE,
    HISTORICAL_DATA_ERROR,
    INDICATOR_DETAILS_RESPONSE,
    INDICATOR_DETAILS_ERROR,
    LIVE_INDICATOR_RESPONSE,
    RSI_SCANNER_RESPONSE,
    RSI_SCANNER_ERROR,
    STOCKS_LIST,
    STOCK_UPDATE,
    LIVE_TICK,
    GOLD_UPDATE,
};

export default SocketEvents;
