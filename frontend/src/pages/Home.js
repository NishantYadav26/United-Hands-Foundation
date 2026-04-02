import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Users, MapPin, Heart, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PillarsOfImpact from '@/components/PillarsOfImpact';
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

// Add this helper to prevent .map crashes
const ensureArray = (data) => (Array.isArray(data) ? data : []);

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeStats = (data) => ({
  patients_served: toNumber(data?.patients_served),
  districts_covered: toNumber(data?.districts_covered),
  total_donations: toNumber(data?.total_donations),
  total_amount: toNumber(data?.total_amount)
});

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;
const HOME_CACHE_KEY = 'uhf_home_cache_v1';
const REQUEST_TIMEOUT_MS = 4500;

const Home = () => {
  const [stats, setStats] = useState({
    patients_served: 0,
    districts_covered: 0,
    total_donations: 0,
    total_amount: 0
  });
  const [successStories, setSuccessStories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [siteAssets, setSiteAssets] = useState({});
  const [pillars, setPillars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isMobileGalleryModalOpen, setIsMobileGalleryModalOpen] = useState(false);
  const normalizeText = (value) => (value || '').toString().trim().toLowerCase();
  const isPartner = (pillar) => {
    const category = normalizeText(pillar?.category);
    const role = normalizeText(pillar?.role);
    const name = normalizeText(pillar?.name);
    return category.startsWith('partner') || role.includes('partner') || name.includes('partner');
  };
  const isTeamPillar = (pillar) => !isPartner(pillar);
  const partners = pillars.filter((pillar) => isPartner(pillar));
  const teamPillars = pillars.filter((pillar) => isTeamPillar(pillar));
  const fallbackLocations = ['Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani'];
  const visibleLocations = locations.length > 0 ? locations : fallbackLocations.map((name) => ({ name }));

  const statsRef = useRef(null);
  const heroRef = useRef(null);
  const openMobileGalleryModal = () => {
    setIsMobileGalleryModalOpen(true);
  };

  const closeMobileGalleryModal = () => {
    setIsMobileGalleryModalOpen(false);
  };

  useEffect(() => {
    if (!isMobileGalleryModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileGalleryModalOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      // Keep pillars in critical requests so Team/Partner sections render reliably on first paint.
      const criticalRequests = await Promise.allSettled([
        axios.get(`${API}/stats`),
        axios.get(`${API}/site-assets`),
        axios.get(`${API}/locations`),
        axios.get(`${API}/pillars`)
      ]);

      if (!isMounted) return;

      const [statsRes, assetsRes, locationsRes, pillarsRes] = criticalRequests;

      if (statsRes.status === 'fulfilled') {
        setStats(normalizeStats(statsRes.value.data));
      } else {
        console.error('Failed to fetch stats:', statsRes.reason);
      }

      if (assetsRes.status === 'fulfilled') {
        const assetsMap = {};
        (assetsRes.value.data.assets || []).forEach((a) => { assetsMap[a.asset_key] = a.asset_url; });
        setSiteAssets(assetsMap);
      } else {
        console.error('Failed to fetch site assets:', assetsRes.reason);
      }

      if (locationsRes.status === 'fulfilled') {
        setLocations(ensureArray(locationsRes.value.data));
      } else {
        console.error('Failed to fetch locations:', locationsRes.reason);
      }

      if (pillarsRes.status === 'fulfilled') {
        setPillars(ensureArray(pillarsRes.value.data));
      } else {
        console.error('Failed to fetch pillars:', pillarsRes.reason);
      }

      Promise.allSettled([
        axios.get(`${API}/success-stories?limit=3`),
        axios.get(`${API}/gallery`)
      ]).then((deferredRequests) => {
        if (!isMounted) return;
        const [storiesRes, galleryRes] = deferredRequests;

        if (storiesRes.status === 'fulfilled') {
          setSuccessStories(ensureArray(storiesRes.value.data));
        } else {
          console.error('Failed to fetch success stories:', storiesRes.reason);
        }

        if (galleryRes.status === 'fulfilled') {
          setGalleryImages(ensureArray(galleryRes.value.data));
        } else {
          console.error('Failed to fetch gallery:', galleryRes.reason);
        }
      });
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    if (reducedMotion) return;

    const yOffset = isSmallScreen ? 24 : 36;
    const heroYOffset = isSmallScreen ? 28 : 50;

    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: heroYOffset },
      { opacity: 1, y: 0, duration: isSmallScreen ? 0.8 : 1.1, ease: 'power2.out' }
    );

    if (statsRef.current && stats.patients_served > 0) {
      const statElements = statsRef.current.querySelectorAll('.stat-number');

      statElements.forEach((element) => {
        const finalValue = parseInt(element.dataset.value);

        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 70%',
          onEnter: () => {
            gsap.to(element, {
              innerText: finalValue,
              duration: 2,
              snap: { innerText: 1 },
              ease: 'power2.out',
              onUpdate: function () {
                element.innerText = Math.ceil(this.targets()[0].innerText).toLocaleString();
              }
            });
          },
          once: true
        });
      });
    }

    gsap.utils.toArray('.reveal-section').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: yOffset },
        {
          opacity: 1,
          y: 0,
          duration: isSmallScreen ? 0.7 : 0.95,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    });

    if (gsap.utils.toArray('.home-people-card').length && document.querySelector('[data-testid="founders-section"]')) {
      gsap.fromTo(
        '.home-people-card',
        { opacity: 0, x: (i) => (i % 2 === 0 ? 60 : -60), y: 16 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '[data-testid="founders-section"]',
            start: 'top 75%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    if (gsap.utils.toArray('.pop-card-lr').length) {
      gsap.utils.toArray('.pop-card-lr').forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: index % 2 === 0 ? (isSmallScreen ? -24 : -58) : (isSmallScreen ? 24 : 58),
            y: isSmallScreen ? 10 : 16,
            scale: isSmallScreen ? 0.985 : 0.96
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: isSmallScreen ? 0.62 : 0.82,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: isSmallScreen ? 'top 82%' : 'top 76%',
              toggleActions: 'play none none none',
              once: true,
              invalidateOnRefresh: true
            }
          }
        );
      });
    }

    if (gsap.utils.toArray('.gallery-card').length && document.querySelector('.gallery-animated-grid')) {
      gsap.fromTo(
        '.gallery-card',
        { opacity: 0, y: 45, scale: 0.93 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gallery-animated-grid',
            start: 'top 74%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    if (gsap.utils.toArray('.impact-stat-card').length) {
      gsap.fromTo(
        '.impact-stat-card',
        { opacity: 0, y: 36, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '#impact',
            start: 'top 72%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    if (gsap.utils.toArray('.founder-card').length && document.querySelector('[data-testid=\"founders-section\"]')) {
      gsap.fromTo(
        '.founder-card',
        { opacity: 0, y: 40, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-testid=\"founders-section\"]',
            start: 'top 70%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    if (gsap.utils.toArray('.district-pill').length && document.querySelector('[data-testid=\"trust-bar\"]')) {
      gsap.fromTo(
        '.district-pill',
        { opacity: 0, y: 28, scale: 0.88, rotateX: 12, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.08,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '[data-testid=\"trust-bar\"]',
            start: 'top 78%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    if (gsap.utils.toArray('.story-card').length && document.querySelector('[data-testid=\"success-stories-section\"]')) {
      gsap.fromTo(
        '.story-card',
        { opacity: 0, y: 35, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-testid=\"success-stories-section\"]',
            start: 'top 75%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    if (document.querySelector('.cta-animated-card') && document.querySelector('[data-testid=\"cta-section\"]')) {
      gsap.fromTo(
        '.cta-animated-card',
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-testid=\"cta-section\"]',
            start: 'top 74%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [stats]);

  const partnerCards = partners.length > 0
    ? partners
    : pillars.filter((pillar) => pillar.image_url).slice(0, 3);
  const teamPillarCards = teamPillars.length > 0
    ? teamPillars
    : pillars.filter((pillar) => !isPartner(pillar) && pillar.image_url).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero Section - keeps dark overlay for image visibility */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 px-6"
        style={{
          background: siteAssets.hero_background
            ? `url(${siteAssets.hero_background}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0B1F3A 0%, #163455 100%)'
        }}
        data-testid="hero-section"
      >
        {/* Gradient overlay - lighter to show people */}
        <div
          className="absolute inset-0"
          style={{
            background: siteAssets.hero_background
              ? 'linear-gradient(180deg, rgba(10,25,47,0.35) 0%, rgba(10,25,47,0.45) 40%, rgba(10,25,47,0.55) 100%)'
              : 'linear-gradient(135deg, rgba(11,31,58,0.95) 0%, rgba(22,52,85,0.95) 100%)'
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-none mb-6"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              color: '#F6F3ED',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)'
            }}
            data-testid="hero-title"
          >
            Hands United,<br />Hearts Connected
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-12 tracking-wide" style={{ color: 'rgba(246,243,237,0.9)', textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
            Empowering communities through healthcare, education, disaster relief,
            and elderly care across Maharashtra. Every contribution builds dignity,
            hope, and a brighter future.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/donate" data-testid="hero-donate-btn">
              <button className="btn-gold">Support Our Cause</button>
            </Link>
            <a
              href="#impact"
              className="px-8 py-4 border-2 text-sm font-semibold tracking-[0.1em] uppercase transition-all rounded"
              style={{ borderColor: 'rgba(246,243,237,0.6)', color: '#F6F3ED' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(246,243,237,0.15)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              See Our Impact
            </a>
          </div>

          <div className="mt-12 inline-block px-6 py-3 rounded" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <p className="text-sm" style={{ color: '#F6F3ED' }}>
              Indian Donors Only (INR) | 80G Tax Exemption Available
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar - Districts */}
      <section className="py-12 bg-section-alt" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-teal)' }}>
              Serving Communities Across
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Updated live from the admin location dashboard
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleLocations.map((district, idx) => (
              <div
                key={district.id || district.name}
                className="text-center district-pill card-elevated hover-lift rounded-xl p-4"
                style={{
                  background: idx % 2 === 0
                    ? 'linear-gradient(145deg, rgba(31,111,109,0.09), rgba(255,255,255,0.95))'
                    : 'linear-gradient(145deg, rgba(198,161,91,0.14), rgba(255,255,255,0.95))'
                }}
              >
                <MapPin className="mx-auto mb-2" style={{ color: 'var(--accent-teal)' }} size={20} />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{district.name}</span>
                {district.description && (
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {district.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars of Impact */}
      <PillarsOfImpact />

      {/* Heartiest Moments Gallery */}
      {galleryImages.length > 0 && (
        <section className="py-20 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="heartiest-moments-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-4">
              <Heart className="mx-auto mb-4" style={{ color: 'var(--accent-gold)' }} size={32} fill="var(--accent-gold)" />
              <h2
                className="text-4xl sm:text-5xl font-medium tracking-tight mb-4"
                style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              >
                Heartiest <span className="text-gradient-orange">Moments</span>
              </h2>
              <p className="text-base mb-14" style={{ color: 'var(--text-muted)' }}>
                Glimpses of hope, service, and transformation from the field
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gallery-animated-grid">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="rounded-lg overflow-hidden hover-lift card-elevated gallery-card mobile-gallery-preview-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`gallery-image-${image.id}`}
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover identity-lock transition-transform duration-500 hover:scale-105"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{image.title}</h3>
                    {image.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{image.description}</p>
                    )}
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-surface)', color: 'var(--accent-teal)' }}>
                      {image.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="gallery-mobile-view-all-btn" onClick={openMobileGalleryModal}>
              View all heartiest moments
            </button>
          </div>
        </section>
      )}
      {isMobileGalleryModalOpen && createPortal(
        <div className="gallery-mobile-modal is-open" role="dialog" aria-modal="true" aria-label="All photos">
          <button type="button" className="gallery-mobile-modal-close" onClick={closeMobileGalleryModal} aria-label="Close gallery">
            ×
          </button>
          <button type="button" className="gallery-mobile-modal-back" onClick={closeMobileGalleryModal}>
            Back to home
          </button>
          <div className="gallery-mobile-modal-content">
            {galleryImages.map((image, index) => (
              <div key={`mobile-modal-image-${image.id || index}`} className="gallery-mobile-modal-item">
                <img src={image.image_url} alt={image.title} className="w-full h-auto object-cover identity-lock" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Impact Stats */}
      <section ref={statsRef} id="impact" className="py-20 px-6 reveal-section" data-testid="impact-stats-section">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Our <span className="text-gradient-blue">Impact</span>
          </h2>
          <p className="text-center text-base mb-14" style={{ color: 'var(--text-muted)' }}>Transforming lives across communities, one step at a time</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-elevated p-10 rounded-lg hover-lift text-center impact-stat-card" data-testid="stat-patients">
              <Users className="mx-auto mb-5" style={{ color: 'var(--accent-teal)' }} size={44} />
              <div className="stat-number text-5xl font-medium mb-3" data-value={stats.patients_served} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-teal)' }}>Lives Touched</p>
            </div>

            <div className="card-elevated p-10 rounded-lg hover-lift text-center impact-stat-card" data-testid="stat-districts">
              <MapPin className="mx-auto mb-5" style={{ color: 'var(--accent-gold)' }} size={44} />
              <div className="stat-number text-5xl font-medium mb-3" data-value={stats.districts_covered} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-gold)' }}>Districts Covered</p>
            </div>

            <div className="card-elevated p-10 rounded-lg hover-lift text-center impact-stat-card" data-testid="stat-donations">
              <Heart className="mx-auto mb-5" style={{ color: 'var(--accent-teal)' }} size={44} />
              <div className="stat-number text-5xl font-medium mb-3" data-value={stats.total_donations} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-teal)' }}>Donations Received</p>
            </div>

            <div className="card-elevated p-10 rounded-lg hover-lift text-center impact-stat-card" data-testid="stat-amount">
              <TrendingUp className="mx-auto mb-5" style={{ color: 'var(--accent-gold)' }} size={44} />
              <div className="stat-number text-5xl font-medium mb-3" data-value={stats.total_amount} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-gold)' }}>Total Raised (INR)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      {successStories.length > 0 && (
        <section className="py-20 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="success-stories-section">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-14"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
            >
              Stories of <span className="text-gradient-orange">Hope</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story) => (
                <div key={story.id} className="card-elevated p-8 rounded-lg hover-lift story-card" data-testid={`story-${story.id}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin style={{ color: 'var(--accent-teal)' }} size={18} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-teal)' }}>{story.location}</span>
                  </div>
                  <p className="leading-relaxed mb-6" style={{ color: 'var(--text-primary)' }}>{story.story_text}</p>
                  <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{story.patient_count} beneficiaries</span>
                    <span>{new Date(story.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Founders Section */}
      <section className="py-20 px-6 reveal-section" data-testid="founders-section">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Meet Our <span className="text-gradient-blue">Founders</span>
          </h2>
          <p className="text-center text-base mb-14" style={{ color: 'var(--text-muted)' }}>Ex-Government of India doctors dedicated to community service</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {siteAssets.founder_1 && (
              <div className="text-center founder-card" data-testid="founder-rahul">
                <div className="mb-6 overflow-hidden rounded-lg card-elevated">
                  <img
                    src={siteAssets.founder_1}
                    alt="Dr. Rahul Sarwade"
                    className="w-full h-96 object-cover identity-lock"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <h3 className="text-2xl font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Dr. Rahul Sarwade</h3>
                <p className="text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--accent-gold)' }}>Co-Founder</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Former Government of India medical officer bringing decades of healthcare expertise to community service.</p>
              </div>
            )}

            {siteAssets.founder_2 && (
              <div className="text-center founder-card" data-testid="founder-jagruti">
                <div className="mb-6 overflow-hidden rounded-lg card-elevated">
                  <img
                    src={siteAssets.founder_2}
                    alt="Dr. Jagruti Hankare"
                    className="w-full h-96 object-cover identity-lock"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <h3 className="text-2xl font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Dr. Jagruti Hankare</h3>
                <p className="text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{ color: 'var(--accent-gold)' }}>Co-Founder</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Dedicated healthcare professional committed to improving quality of life for underserved communities.</p>
              </div>
            )}
          </div>

          <div className="mt-16" data-testid="home-team-pillars-section">
            <h3 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-gold">Pillars</span>
            </h3>
            {teamPillarCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamPillarCards.map((pillar) => (
                  <div key={pillar.id} className="card-elevated p-6 rounded-lg hover-lift text-center pop-card-lr" data-testid={`home-pillar-${pillar.id}`}>
                    {pillar.image_url && (
                      <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border blue-border">
                        <img
                          src={pillar.image_url}
                          alt={pillar.name}
                          className="w-full h-full object-cover identity-lock"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <h4 className="text-lg font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{pillar.name}</h4>
                    <p className="text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>{pillar.role}</p>
                    {pillar.specialty && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pillar.specialty}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 rounded-lg text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add team pillars from dashboard → Team & Partners tab to highlight your core members here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-16" data-testid="home-partners-section">
            <h3 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-blue">Partners</span>
            </h3>
            {partnerCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 partners-animated-grid">
                {partnerCards.map((partner) => (
                  <div key={partner.id} className="card-elevated p-6 rounded-lg hover-lift text-center partner-card home-people-card" data-testid={`partner-${partner.id}`}>
                    {partner.image_url && (
                      <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border blue-border">
                        <img
                          src={partner.image_url}
                          alt={partner.name}
                          className="w-full h-full object-cover identity-lock"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <h4 className="text-lg font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{partner.name}</h4>
                    <p className="text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>{partner.role}</p>
                    {partner.specialty && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{partner.specialty}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-8 rounded-lg text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add partners from dashboard → Team & Partners tab to show official partner profiles here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Authority Ticker */}
      <section className="py-10 bg-section-alt overflow-hidden" data-testid="authority-ticker">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center gap-16 marquee">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-16">
                <span className="text-sm tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>Featured In</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Sakal</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Lokmat</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Maharashtra Times</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>The Hindu</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Indian Express</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 reveal-section" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center card-elevated p-16 rounded-lg cta-animated-card">
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Be the <span className="text-gradient-gold">Change</span>
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
            Your contribution provides healthcare, education, disaster relief, and dignity to communities who need it most.
          </p>
          <Link to="/donate" data-testid="cta-donate-btn">
            <button className="btn-gold">Make a Difference Today</button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
