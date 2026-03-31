import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnimatedLogo = ({ size = 'md' }) => {
  const [logoUrl, setLogoUrl] = useState('');

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

  if (!logoUrl) return null;

  return (
    <div
      className={`${sizeClasses[size]} logo-container cursor-pointer transition-all duration-300`}
      data-testid="animated-logo"
    >
      <img
        src={logoUrl}
        alt="United Hands Foundation"
        className="w-full h-full object-contain logo-see-through"
        style={{ transition: 'transform 0.3s ease' }}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
      />
    </div>
  );
};

export default AnimatedLogo;
