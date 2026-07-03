import { Suspense, lazy, useEffect } from "react";
import FloatingEventsButton from "@/components/FloatingEventsButton";
import CursorTrail from "@/components/CursorTrail";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import usePillarScrollAnimation from "@/hooks/usePillarScrollAnimation";
import "@/App.css";

const Home = lazy(() => import("@/pages/Home"));
const Donate = lazy(() => import("@/pages/Donate"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const PressMedia = lazy(() => import("@/pages/PressMedia"));
const Transparency = lazy(() => import("@/pages/Transparency"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const TrackMyImpact = lazy(() => import("@/pages/TrackMyImpact"));
const UserAuth = lazy(() => import("@/pages/UserAuth"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));

const isLowEndDevice = () => {
  const coreCount = navigator.hardwareConcurrency || 4;
  const deviceMemory = navigator.deviceMemory || 4;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reducedMotion || coreCount <= 4 || deviceMemory <= 2;
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('uhf_admin_token');
  return token ? children : <Navigate to="/uhf-admin" replace />;
};


const AppRoutes = () => {
  const location = useLocation();
  usePillarScrollAnimation(location.pathname);

  useEffect(() => {
    if (location.pathname === '/' || isLowEndDevice()) return;

    let cleanup = () => {};

    const loadRouteAnimations = async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

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

      cleanup = () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    };

    loadRouteAnimations();

    return () => {
      cleanup();
    };
  }, [location.pathname]);

  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-deep)' }} />}>
      <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/press" element={<PressMedia />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/track-impact" element={<TrackMyImpact />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
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
      <FloatingEventsButton />
      </>
    </Suspense>
  );
};

function App() {
  return (
    <div className="App">
      <CursorTrail />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
