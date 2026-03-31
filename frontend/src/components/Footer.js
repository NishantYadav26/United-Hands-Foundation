import { useState, useEffect } from 'react';
import { Heart, Mail, MapPin, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
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
    <footer style={{ background: '#1F2933', marginTop: '0' }} data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart style={{ color: '#C6A15B' }} size={28} fill="#C6A15B" />
              <h3 className="text-2xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F6F3ED' }}>United Hands</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#A7B1BC' }}>
              Empowering communities through healthcare, education, disaster relief, and elderly care across Dharashiv, Solapur, Latur, Palghar, and Panchgani since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{ color: '#C6A15B' }}>Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>Home</Link>
              <Link to="/about" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>About Us</Link>
              <Link to="/donate" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>Donate</Link>
              <Link to="/press" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>Press & Media</Link>
              <Link to="/transparency" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>Transparency</Link>
              <Link to="/login" className="text-sm transition-colors hover:text-white" style={{ color: '#A7B1BC' }}>Login / Register</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{ color: '#C6A15B' }}>Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 flex-shrink-0" style={{ color: '#5FA8A6' }} size={16} />
                <span className="text-sm" style={{ color: '#A7B1BC' }}>Uniteduhf@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 flex-shrink-0" style={{ color: '#5FA8A6' }} size={16} />
                <span className="text-sm" style={{ color: '#A7B1BC' }}>+91 9730267630</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 flex-shrink-0" style={{ color: '#C6A15B' }} size={16} />
                <span className="text-sm" style={{ color: '#A7B1BC' }}>Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512</span>
              </div>
            </div>

            {/* Social Links */}
            {(socialLinks.facebook_url || socialLinks.instagram_url || socialLinks.youtube_url) && (
              <div className="mt-6" data-testid="footer-social-links">
                <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-4" style={{ color: '#C6A15B' }}>Follow Us</h4>
                <div className="flex items-center gap-4">
                  {socialLinks.facebook_url && (
                    <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)' }} data-testid="social-facebook">
                      <Facebook size={20} style={{ color: '#5FA8A6' }} />
                    </a>
                  )}
                  {socialLinks.instagram_url && (
                    <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)' }} data-testid="social-instagram">
                      <Instagram size={20} style={{ color: '#5FA8A6' }} />
                    </a>
                  )}
                  {socialLinks.youtube_url && (
                    <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)' }} data-testid="social-youtube">
                      <Youtube size={20} style={{ color: '#5FA8A6' }} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#F6F3ED' }}>
              PAN: AABTU0797K | 80G: AABTU0797KF20231 | 12A: AABTU0797KE20231
            </p>
            <p className="text-xs" style={{ color: '#A7B1BC' }}>
              Societies Reg: Latur/0000171/2020 | Registered: 04/08/2020
            </p>
          </div>
          <p className="text-sm text-center" style={{ color: '#A7B1BC' }}>
            &copy; {new Date().getFullYear()} United Hands Foundation. Registered under Section 80G & 12A. All rights reserved.
          </p>
          <p className="text-xs text-center mt-2" style={{ color: '#A7B1BC' }}>
            Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
