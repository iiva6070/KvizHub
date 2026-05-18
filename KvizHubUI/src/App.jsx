import { Suspense } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbars/Navbar";
import { primaryRoutes } from "./routes/primaryRoutes";
import { secondaryRoutes } from "./routes/secondaryRoutes";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-content">
        <Suspense
          fallback={<div className="loading-container">Loading...</div>}
        >
          <Routes>
            {primaryRoutes}
            {secondaryRoutes}
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
