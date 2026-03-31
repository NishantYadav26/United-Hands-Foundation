import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const AnimatedLogo = ({ size = 'md', visualScale = 1, className = '' }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API}/site-assets/logo`);
        setLogoUrl(response.data.asset_url);
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      }
    };
    fetchLogo();
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const logoScale = useMemo(() => {
    return isHovered ? visualScale * 1.08 : visualScale;
  }, [isHovered, visualScale]);

  if (!logoUrl) return null;

  return (
    <div
      className={`${sizeClasses[size]} ${className} logo-container cursor-pointer overflow-visible transition-all duration-300`}
      data-testid="animated-logo"
    >
      <img
        src={logoUrl}
        alt="United Hands Foundation"
        className="w-full h-full object-contain logo-see-through"
        style={{ transform: `scale(${logoScale})`, transition: 'transform 0.3s ease' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
};

export default AnimatedLogo;
