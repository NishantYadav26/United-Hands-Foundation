import { useEffect, useMemo, useState } from 'react';
import { getCached } from '@/lib/apiClient';

const HOME_CACHE_KEY = 'uhf_home_cache_v1';

const readCachedLogo = () => {
  try {
    const cached = localStorage.getItem(HOME_CACHE_KEY);
    if (!cached) return '';
    const parsed = JSON.parse(cached);
    return parsed?.siteAssets?.logo || '';
  } catch (error) {
    return '';
  }
};

const AnimatedLogo = ({ size = 'md', visualScale = 1, className = '' }) => {
  const [logoUrl, setLogoUrl] = useState(() => readCachedLogo());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await getCached(`/site-assets/logo`, { cacheTtlMs: 3600000 });
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
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
    </div>
  );
};

export default AnimatedLogo;
