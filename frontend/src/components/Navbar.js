import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
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

  const handleLogout = () => {
    localStorage.removeItem('uhf_user_token');
    localStorage.removeItem('uhf_user_data');
    localStorage.removeItem('uhf_admin_token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="glass-morph fixed top-0 left-0 right-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')} data-testid="logo-link">
            <AnimatedLogo size="md" />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-medium tracking-tight" style={{fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)'}}>
                United Hands
              </h1>
              <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase" style={{color: 'var(--text-muted)'}}>Foundation</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}} data-testid="nav-home">Home</Link>
            <Link to="/about" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}} data-testid="nav-about">About</Link>
            <Link to="/press" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}} data-testid="nav-press">Press</Link>
            <Link to="/transparency" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}} data-testid="nav-transparency">Transparency</Link>
            <Link to="/track-impact" className="text-sm font-semibold transition-colors" style={{color: 'var(--accent-warm)'}} data-testid="nav-track">Track Impact</Link>
            <a href="#contact" onClick={(e) => { e.preventDefault(); const footer = document.querySelector('[data-testid="main-footer"]'); if(footer) footer.scrollIntoView({behavior: 'smooth'}); }} className="text-sm transition-colors flex items-center gap-1" style={{color: 'var(--text-primary)'}} data-testid="nav-contact">
              <Phone size={14} />
              Contact Us
            </a>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm flex items-center gap-1" style={{color: 'var(--accent-teal)'}}>
                  <User size={14} />
                  {user.name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded transition-colors"
                  style={{color: 'var(--text-muted)', border: '1px solid var(--border-subtle)'}}
                  data-testid="nav-logout-btn"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" data-testid="nav-login">
                <button className="flex items-center gap-1.5 text-sm px-4 py-2 rounded transition-colors" style={{color: 'var(--accent-teal)', border: '1px solid var(--accent-teal)'}}>
                  <LogIn size={14} />
                  Login
                </button>
              </Link>
            )}
            
            <Link to="/donate" data-testid="nav-donate">
              <button className="btn-orange px-4 py-2 sm:px-8 sm:py-3 text-sm">Donate Now</button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2" 
            style={{color: 'var(--accent-teal)'}}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 flex flex-col gap-3 pt-4" style={{borderTop: '1px solid var(--border-subtle)'}} data-testid="mobile-menu">
            <Link to="/" className="py-2 transition-colors" style={{color: 'var(--text-primary)'}} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="py-2 transition-colors" style={{color: 'var(--text-primary)'}} onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/press" className="py-2 transition-colors" style={{color: 'var(--text-primary)'}} onClick={() => setMobileMenuOpen(false)}>Press</Link>
            <Link to="/transparency" className="py-2 transition-colors" style={{color: 'var(--text-primary)'}} onClick={() => setMobileMenuOpen(false)}>Transparency</Link>
            <Link to="/track-impact" className="font-semibold py-2 transition-colors" style={{color: 'var(--accent-warm)'}} onClick={() => setMobileMenuOpen(false)}>Track My Impact</Link>
            <a href="#contact" onClick={(e) => { e.preventDefault(); const footer = document.querySelector('[data-testid="main-footer"]'); if(footer) footer.scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false); }} className="py-2 transition-colors flex items-center gap-1" style={{color: 'var(--text-primary)'}}>
              <Phone size={14} />
              Contact Us
            </a>
            
            {user ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{color: 'var(--accent-teal)'}}>{user.name}</span>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-sm flex items-center gap-1" style={{color: 'var(--text-muted)'}}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="flex items-center gap-1.5 text-sm py-2" style={{color: 'var(--accent-teal)'}}>
                  <LogIn size={14} /> Login / Register
                </button>
              </Link>
            )}
            
            <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
              <button className="btn-orange w-full mt-2">Donate Now</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
