import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-24" style={{background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)'}} data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart style={{color: 'var(--accent-warm)'}} size={28} fill="var(--accent-warm)" />
              <h3 className="text-2xl font-medium" style={{fontFamily: 'Cormorant Garamond, serif'}}>United Hands</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{color: 'var(--text-muted)'}}>
              Empowering communities through healthcare, education, disaster relief, and elderly care across Dharashiv, Solapur, Latur, Palghar, and Panchgani since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{color: 'var(--accent-warm)'}}>Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>Home</Link>
              <Link to="/donate" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>Donate</Link>
              <Link to="/press" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>Press & Media</Link>
              <Link to="/transparency" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>Transparency</Link>
              <Link to="/login" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>Login / Register</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{color: 'var(--accent-warm)'}}>Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1" style={{color: 'var(--accent-teal)'}} size={16} />
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>Uniteduhf@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1" style={{color: 'var(--accent-teal)'}} size={16} />
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>+91 9028882496</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1" style={{color: 'var(--accent-warm)'}} size={16} />
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8" style={{borderTop: '1px solid var(--border-subtle)'}}>
          <div className="text-center mb-4">
            <p className="text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
              PAN: AABTU0797K | 80G: AABTU0797KF20231 | 12A: AABTU0797KE20231
            </p>
            <p className="text-xs" style={{color: 'var(--text-muted)'}}>
              Societies Reg: Latur/0000171/2020 | Registered: 04/08/2020
            </p>
          </div>
          <p className="text-sm text-center" style={{color: 'var(--text-muted)'}}>
            &copy; {new Date().getFullYear()} United Hands Foundation TA JI LATUR. Registered under Section 80G & 12A. All rights reserved.
          </p>
          <p className="text-xs text-center mt-2" style={{color: 'var(--text-muted)'}}>
            New Bhagya Nagar, Ring Road, Latur, Maharashtra - 413512
          </p>
          <div className="text-center mt-4">
            <Link to="/uhf-admin" className="text-xs transition-colors" style={{color: 'var(--text-muted)'}}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
