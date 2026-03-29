import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass-morph fixed top-0 left-0 right-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <Heart className="text-[#D4AF37]" size={32} fill="#D4AF37" />
            <div>
              <h1 className="text-2xl font-medium text-[#F5F5F7] tracking-tight" style={{fontFamily: 'Cormorant Garamond, serif'}}>United Hands</h1>
              <p className="text-xs text-[#A1A1AA] tracking-[0.2em] uppercase">Foundation</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors" data-testid="nav-home">Home</Link>
            <Link to="/about" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors" data-testid="nav-about">About</Link>
            <Link to="/press" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors" data-testid="nav-press">Press</Link>
            <Link to="/transparency" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors" data-testid="nav-transparency">Transparency</Link>
            <Link to="/donate" data-testid="nav-donate">
              <button className="btn-gold">Donate Now</button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[#D4AF37]" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4 flex flex-col gap-4" data-testid="mobile-menu">
            <Link to="/" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors">Home</Link>
            <Link to="/about" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors">About</Link>
            <Link to="/press" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors">Press</Link>
            <Link to="/transparency" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors">Transparency</Link>
            <Link to="/donate">
              <button className="btn-gold w-full">Donate Now</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;