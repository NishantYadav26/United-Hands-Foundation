import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCached } from '@/lib/apiClient';
import AnimatedLogo from '@/components/AnimatedLogo';


const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/donate', label: 'Donate' },
  { to: '/press', label: 'Press & Media' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/login', label: 'Login / Register' }
];

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState({ facebook_url: '', instagram_url: '', youtube_url: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getCached(`/admin/settings`, { cacheTtlMs: 300000 });
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
    <footer style={{ marginTop: '0' }} data-testid="main-footer">
      <div className="footer-stripe" aria-hidden="true" />
      <div style={{ background: 'linear-gradient(180deg, #0C3B24 0%, #072418 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-white p-1.5 flex items-center justify-center">
                  <AnimatedLogo size="sm" />
                </div>
                <div>
                  <h3 className="text-2xl" style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>United Hands</h3>
                  <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#8FCBA4' }}>Foundation</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#BCD9C6' }}>
                Empowering communities through healthcare, education, disaster relief, and elderly care across Dharashiv, Solapur, Latur, Palghar, and Panchgani since 2020.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{ color: '#F5A25C' }}>Quick Links</h4>
              <div className="flex flex-col gap-3 items-start">
                {quickLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="footer-link">{label}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-6" style={{ color: '#F5A25C' }}>Contact Us</h4>
              <div className="flex flex-col gap-4">
                <a href="mailto:Uniteduhf@gmail.com" className="footer-link"><Mail size={16} style={{ color: '#8FCBA4' }} />Uniteduhf@gmail.com</a>
                <a href="tel:+919730267630" className="footer-link"><Phone size={16} style={{ color: '#8FCBA4' }} />+91 9730267630</a>
                <span className="footer-link" style={{ cursor: 'default' }}><MapPin size={16} className="shrink-0" style={{ color: '#8FCBA4' }} />Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512</span>
              </div>

              {/* Social Links */}
              {(socialLinks.facebook_url || socialLinks.instagram_url || socialLinks.youtube_url) && (
                <div className="mt-6" data-testid="footer-social-links">
                  <h4 className="text-xs tracking-[0.2em] uppercase font-bold mb-4" style={{ color: '#F5A25C' }}>Follow Us</h4>
                  <div className="flex items-center gap-4">
                    {socialLinks.facebook_url && (
                      <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.1)' }} data-testid="social-facebook">
                        <Facebook size={18} style={{ color: '#8FCBA4' }} />
                      </a>
                    )}
                    {socialLinks.instagram_url && (
                      <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.1)' }} data-testid="social-instagram">
                        <Instagram size={18} style={{ color: '#8FCBA4' }} />
                      </a>
                    )}
                    {socialLinks.youtube_url && (
                      <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.1)' }} data-testid="social-youtube">
                        <Youtube size={18} style={{ color: '#8FCBA4' }} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="text-center mb-4">
              <p className="text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                PAN: AABTU0797K | 80G: AABTU0797KF20231 | 12A: AABTU0797KE20231
              </p>
              <p className="text-xs" style={{ color: '#BCD9C6' }}>
                Societies Reg: Latur/171/2020 | Registered: 04/08/2020
              </p>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: '#BCD9C6' }}>
                Account Name: United Hands Foundation | Account Number: 09900100048917 | IFSC: BARB0LATURX (fifth character is zero)
              </p>
            </div>
            <p className="text-sm text-center" style={{ color: '#BCD9C6' }}>
              &copy; {new Date().getFullYear()} United Hands Foundation. Registered under Section 80G & 12A. All rights reserved.
            </p>
            <p className="text-xs text-center mt-2" style={{ color: '#8FCBA4' }}>
              Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, Maharashtra - 413512
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
