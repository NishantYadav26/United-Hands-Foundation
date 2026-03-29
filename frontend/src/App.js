import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Donate from "@/pages/Donate";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import PressMedia from "@/pages/PressMedia";
import Transparency from "@/pages/Transparency";
import AboutUs from "@/pages/AboutUs";
import TrackMyImpact from "@/pages/TrackMyImpact";
import UserAuth from "@/pages/UserAuth";
import "@/App.css";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('uhf_admin_token');
  return token ? children : <Navigate to="/uhf-admin" replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/press" element={<PressMedia />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/track-impact" element={<TrackMyImpact />} />
          <Route path="/login" element={<UserAuth />} />
          <Route path="/uhf-admin" element={<UserAuth />} />
          <Route 
            path="/uhf-admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
