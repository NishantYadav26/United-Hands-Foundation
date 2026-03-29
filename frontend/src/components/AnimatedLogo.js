import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnimatedLogo = ({ size = 'md', onClick }) => {
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
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  if (!logoUrl) return null;

  return (
    <div 
      className={`${sizeClasses[size]} logo-container cursor-pointer`}
      onClick={onClick}
      data-testid="animated-logo"
    >
      <img 
        src={logoUrl}
        alt="United Hands Foundation"
        className="w-full h-full object-contain logo-pulse"
      />
      <style jsx>{`
        @keyframes logo-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(52, 152, 219, 0.3));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 20px rgba(52, 152, 219, 0.6));
          }
        }

        .logo-pulse {
          animation: logo-pulse 3s ease-in-out infinite;
          transition: transform 0.3s ease;
        }

        .logo-container:hover .logo-pulse {
          animation: none;
          transform: scale(1.1) rotate(5deg);
          filter: drop-shadow(0 0 25px rgba(230, 126, 34, 0.8));
        }
      `}</style>
    </div>
  );
};

export default AnimatedLogo;
