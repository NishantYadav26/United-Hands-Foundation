import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Donate from "@/pages/Donate";
import AdminDashboard from "@/pages/AdminDashboard";
import PressMedia from "@/pages/PressMedia";
import Transparency from "@/pages/Transparency";
import AboutUs from "@/pages/AboutUs";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/uhf-admin" element={<AdminDashboard />} />
          <Route path="/press" element={<PressMedia />} />
          <Route path="/transparency" element={<Transparency />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
