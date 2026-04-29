import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import Chart from "./pages/Chart";
import Candlestick from "./pages/CandleStick";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <>
      <div>
        {/* Navigation */}
        {/* <nav style={{ display: "flex", gap: "20px" }}>
          <Link to="/">Chart</Link>
          <Link to="/candleStick">CandleStick</Link>
        </nav> */}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Chart />} />
          <Route path="/candleStick" element={<Candlestick />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
