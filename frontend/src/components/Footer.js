import { useState, useEffect } from 'react';
import { Heart, Mail, MapPin, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState({ facebook_url: '', instagram_url: '', youtube_url: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/admin/settings`);
        setSocialLinks({
          facebook_url: response.data.facebook_url || '',
          instagram_url: response.data.instagram_url || '',
          youtube_url: response.data.youtube_url || ''
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

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
              <Link to="/about" className="text-sm transition-colors" style={{color: 'var(--text-primary)'}}>About Us</Link>
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
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>+91 9730267630</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1" style={{color: 'var(--accent-warm)'}} size={16} />
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512</span>
              </div>
            </div>

            {/* Social Links */}
            {(socialLinks.facebook_url || socialLinks.instagram_url || socialLinks.youtube_url) && (
              <div className="mt-6" data-testid="footer-social-links">
                <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-4" style={{color: 'var(--accent-warm)'}}>Follow Us</h4>
                <div className="flex items-center gap-4">
                  {socialLinks.facebook_url && (
                    <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{background: 'var(--bg-surface)'}} data-testid="social-facebook">
                      <Facebook size={20} style={{color: 'var(--accent-teal)'}} />
                    </a>
                  )}
                  {socialLinks.instagram_url && (
                    <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{background: 'var(--bg-surface)'}} data-testid="social-instagram">
                      <Instagram size={20} style={{color: 'var(--accent-teal)'}} />
                    </a>
                  )}
                  {socialLinks.youtube_url && (
                    <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{background: 'var(--bg-surface)'}} data-testid="social-youtube">
                      <Youtube size={20} style={{color: 'var(--accent-teal)'}} />
                    </a>
                  )}
                </div>
              </div>
            )}
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
            &copy; {new Date().getFullYear()} United Hands Foundation. Registered under Section 80G & 12A. All rights reserved.
          </p>
          <p className="text-xs text-center mt-2" style={{color: 'var(--text-muted)'}}>
            Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
