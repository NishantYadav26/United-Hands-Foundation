import { useEffect, useMemo, useState } from 'react';
import { getCached } from '@/lib/apiClient';

const HOME_CACHE_KEY = 'uhf_home_cache_v1';
const PERMANENT_LOGO_KEY = 'uhf_permanent_logo_url';
// Stable fallback so the logo always renders even when the API is unreachable
// (e.g. backend cold-start or down). Matches the seeded UHF logo asset.
const DEFAULT_LOGO_URL = 'https://res.cloudinary.com/dvmb3mzcy/image/upload/v1774896421/uploads/ofvdyoaijp0zd7fvubw6.png';

const readCachedLogo = () => {
  try {
    const permanentLogo = localStorage.getItem(PERMANENT_LOGO_KEY);
    if (permanentLogo) return permanentLogo;

    const cached = localStorage.getItem(HOME_CACHE_KEY);
    if (!cached) return DEFAULT_LOGO_URL;
    const parsed = JSON.parse(cached);
    return parsed?.siteAssets?.logo || DEFAULT_LOGO_URL;
  } catch (error) {
    return DEFAULT_LOGO_URL;
  }
};

const AnimatedLogo = ({ size = 'md', visualScale = 1, className = '' }) => {
  const [logoUrl, setLogoUrl] = useState(() => readCachedLogo());
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await getCached(`/site-assets/logo`, { cacheTtlMs: 3600000 });
        const nextLogo = response?.data?.asset_url || '';
        if (nextLogo) {
          localStorage.setItem(PERMANENT_LOGO_KEY, nextLogo);
          setLogoUrl(nextLogo);
          setImageFailed(false);
        }
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

  const visibleLogoUrl = imageFailed ? DEFAULT_LOGO_URL : logoUrl;

  if (!visibleLogoUrl) return null;

  return (
    <div
      className={`${sizeClasses[size]} ${className} logo-container cursor-pointer overflow-visible transition-all duration-300`}
      data-testid="animated-logo"
    >
      <img
        src={visibleLogoUrl}
        alt="United Hands Foundation"
        className="w-full h-full object-contain logo-see-through"
        style={{ transform: `scale(${logoScale})`, transition: 'transform 0.3s ease' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onError={() => {
          if (visibleLogoUrl !== DEFAULT_LOGO_URL) {
            setImageFailed(true);
          }
        }}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
    </div>
  );
};

export default AnimatedLogo;
