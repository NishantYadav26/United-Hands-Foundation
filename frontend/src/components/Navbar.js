import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User, Phone, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [supportsBackdropFilter, setSupportsBackdropFilter] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('uhf_user_token');
    const userData = localStorage.getItem('uhf_user_data');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('uhf_user_token');
        localStorage.removeItem('uhf_user_data');
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (typeof window !== 'undefined' && window.CSS?.supports) {
      const supported =
        window.CSS.supports('backdrop-filter', 'blur(12px)') ||
        window.CSS.supports('-webkit-backdrop-filter', 'blur(12px)');
      setSupportsBackdropFilter(supported);
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uhf_user_token');
    localStorage.removeItem('uhf_user_data');
    localStorage.removeItem('uhf_admin_token');
    setUser(null);
    navigate('/');
  };

  const scrollToFooter = (e) => {
    e.preventDefault();
    const footer = document.querySelector('[data-testid="main-footer"]');
    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav
      className="
sticky top-0 z-50
bg-white/70
backdrop-blur-md
border-b border-black/5
shadow-sm
transition-all duration-300
"
      style={{
        background: supportsBackdropFilter ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255,255,255,0.9)',
        backdropFilter: supportsBackdropFilter ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: supportsBackdropFilter ? 'blur(12px)' : 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isScrolled ? '0 6px 18px rgba(0, 0, 0, 0.08)' : '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}
      data-testid="main-navbar"
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300"
        style={{ paddingTop: '12px', paddingBottom: '12px' }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer overflow-visible" onClick={() => navigate('/')} data-testid="logo-link">
            <AnimatedLogo size="md" visualScale={1.45} />
            <div className="hidden sm:block">
              <h1
                className="text-lg sm:text-xl font-medium tracking-tight transition-all duration-300"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              >
                United Hands
              </h1>
              <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>Foundation</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            <Link to="/" className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200" data-testid="nav-home">Home</Link>
            <Link to="/about" className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200" data-testid="nav-about">About</Link>
            <Link to="/press" className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200" data-testid="nav-press">Press</Link>
            <Link to="/transparency" className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200" data-testid="nav-transparency">Transparency</Link>
            <Link to="/track-impact" className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200" data-testid="nav-track">Track Impact</Link>
            <a href="#contact" onClick={scrollToFooter} className="text-sm font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-colors duration-200 flex items-center gap-1" data-testid="nav-contact">
              <Phone size={13} />
              Contact
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm flex items-center gap-1 text-[var(--accent-teal)]">
                  <User size={14} />
                  {user.name}
                </span>
                {isAdmin && (
                  <Link to="/uhf-admin/dashboard" data-testid="nav-admin-dashboard">
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all" style={{ background: 'var(--accent-teal)', color: '#fff' }}>
                      <LayoutDashboard size={13} />
                      Dashboard
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded transition-colors"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                  data-testid="nav-logout-btn"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" data-testid="nav-login">
                <button className="flex items-center gap-1.5 text-sm px-4 py-2 rounded transition-colors" style={{ color: 'var(--accent-teal)', border: '1px solid var(--accent-teal)' }}>
                  <LogIn size={14} />
                  Login
                </button>
              </Link>
            )}

            <Link to="/donate" data-testid="nav-donate">
              <button className="btn-gold px-5 py-2 text-sm hover:scale-105 transition-transform" style={{ padding: '10px 24px' }}>Donate Now</button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-black/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }} data-testid="mobile-menu">
            <Link to="/" className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/press" className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Press</Link>
            <Link to="/transparency" className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Transparency</Link>
            <Link to="/track-impact" className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Track My Impact</Link>
            <a href="#contact" onClick={(e) => { scrollToFooter(e); setMobileMenuOpen(false); }} className="font-semibold py-2 text-sm text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200 flex items-center gap-1">
              <Phone size={14} />
              Contact Us
            </a>

            {user ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-black/80">{user.name}</span>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Link to="/uhf-admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded" style={{ background: 'var(--accent-teal)', color: '#fff' }}>
                        <LayoutDashboard size={13} /> Dashboard
                      </button>
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="flex items-center gap-1.5 text-sm py-2 text-black/80 hover:text-[var(--accent-teal)] transition-colors duration-200">
                  <LogIn size={14} /> Login / Register
                </button>
              </Link>
            )}

            <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
              <button className="btn-gold w-full mt-2 text-sm hover:scale-105 transition-transform" style={{ padding: '10px 24px' }}>Donate Now</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
