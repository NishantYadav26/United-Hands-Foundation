import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#27272A] border-t border-[#D4AF37]/20 mt-24" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="text-[#D4AF37]" size={28} fill="#D4AF37" />
              <h3 className="text-2xl font-medium" style={{fontFamily: 'Cormorant Garamond, serif'}}>United Hands</h3>
            </div>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Empowering elderly care through our Vayorang program across Dharashiv, Solapur, Latur, Palghar, and Panchgani since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-6">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors text-sm">Home</Link>
              <Link to="/donate" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors text-sm">Donate</Link>
              <Link to="/press" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors text-sm">Press & Media</Link>
              <Link to="/transparency" className="text-[#F5F5F7] hover:text-[#D4AF37] transition-colors text-sm">Transparency</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-6">Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Mail className="text-[#D4AF37] mt-1" size={16} />
                <span className="text-[#A1A1AA] text-sm">contact@unitedhands.org</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-[#D4AF37] mt-1" size={16} />
                <span className="text-[#A1A1AA] text-sm">+91 XXXXX XXXXX</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-[#D4AF37] mt-1" size={16} />
                <span className="text-[#A1A1AA] text-sm">Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/20 mt-12 pt-8\">
          <div className="text-center mb-4">
            <p className="text-[#F5F5F7] text-sm font-semibold mb-2">
              PAN: AABTU0797K | 80G: AABTU0797KF20231 | 12A: AABTU0797KE20231
            </p>
            <p className="text-[#A1A1AA] text-xs">
              Societies Reg: Latur/0000171/2020 | Registered: 04/08/2020
            </p>
          </div>
          <p className="text-[#A1A1AA] text-sm text-center">
            © {new Date().getFullYear()} United Hands Foundation TA JI LATUR. Registered under Section 80G & 12A. All rights reserved.
          </p>
          <p className="text-[#A1A1AA] text-xs text-center mt-2">
            New Bhagya Nagar, Ring Road, Latur, Maharashtra - 413512
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;