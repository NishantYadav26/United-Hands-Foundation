import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="glass-morph fixed top-0 left-0 right-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3" onClick={() => navigate('/')} data-testid="logo-link">
            <AnimatedLogo size="sm" />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-medium text-[#F5F5F7] tracking-tight" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                United Hands
              </h1>
              <p className="text-[10px] sm:text-xs text-[#A1A1AA] tracking-[0.2em] uppercase">Foundation</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors text-sm" data-testid="nav-home">Home</Link>
            <Link to="/about" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors text-sm" data-testid="nav-about">About</Link>
            <Link to="/press" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors text-sm" data-testid="nav-press">Press</Link>
            <Link to="/transparency" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors text-sm" data-testid="nav-transparency">Transparency</Link>
            <Link to="/track-impact" className="text-[#F5F5F7] hover:text-[#E67E22] transition-colors font-semibold text-sm" data-testid="nav-track">Track Impact</Link>
            <Link to="/donate" data-testid="nav-donate">
              <button className="btn-orange px-4 py-2 sm:px-8 sm:py-3 text-sm">Donate Now</button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2" 
            style={{color: '#3498DB'}}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-[#3498DB]/20 pt-4" data-testid="mobile-menu">
            <Link to="/" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/press" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Press</Link>
            <Link to="/transparency" className="text-[#F5F5F7] hover:text-[#3498DB] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Transparency</Link>
            <Link to="/track-impact" className="text-[#E67E22] hover:text-[#F39C12] transition-colors font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Track My Impact</Link>
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