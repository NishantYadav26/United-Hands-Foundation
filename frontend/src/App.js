import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/App.css";

const Home = lazy(() => import("@/pages/Home"));
const Donate = lazy(() => import("@/pages/Donate"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const PressMedia = lazy(() => import("@/pages/PressMedia"));
const Transparency = lazy(() => import("@/pages/Transparency"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const TrackMyImpact = lazy(() => import("@/pages/TrackMyImpact"));
const UserAuth = lazy(() => import("@/pages/UserAuth"));

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
        <Suspense
          fallback={(
            <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
              Loading page...
            </div>
          )}
        >
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
