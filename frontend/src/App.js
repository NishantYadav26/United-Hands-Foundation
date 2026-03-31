import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') return;

    const sections = gsap.utils.toArray('section');
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            once: true
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [location.pathname]);

  return (
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
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
