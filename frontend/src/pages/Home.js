import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Heart, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import usePillarScrollAnimation from '@/hooks/usePillarScrollAnimation';
import { getCached } from '@/lib/apiClient';


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

const HOME_CACHE_KEY = 'uhf_home_cache_v1';
const PERMANENT_HERO_KEY = 'uhf_permanent_hero_background_url';
const REQUEST_TIMEOUT_MS = 4500;
const HOME_CACHE_TTL_MS = 30 * 60 * 1000;

const readCachedSiteAssets = () => {
  try {
    const permanentHero = localStorage.getItem(PERMANENT_HERO_KEY);
    const cached = localStorage.getItem(HOME_CACHE_KEY);
    const baseAssets = permanentHero ? { hero_background: permanentHero } : {};
    if (!cached) return baseAssets;

    const parsed = JSON.parse(cached);
    const isFresh = parsed?.timestamp && (Date.now() - parsed.timestamp) < HOME_CACHE_TTL_MS;
    if (!isFresh || !parsed?.siteAssets || typeof parsed.siteAssets !== 'object') return baseAssets;

    return { ...parsed.siteAssets, ...baseAssets };
  } catch (error) {
    return {};
  }
};

const Home = () => {
  const [stats, setStats] = useState({
    patients_served: 0,
    districts_covered: 0,
    total_donations: 0,
    total_amount: 0
  });
  const [successStories, setSuccessStories] = useState([]);
  const [siteAssets, setSiteAssets] = useState(() => readCachedSiteAssets());
  const [pillars, setPillars] = useState([]);
  const [locations, setLocations] = useState([]);
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


  useEffect(() => {
    let isMounted = true;
    const cacheSiteAssets = (assetsMap) => {
      try {
        localStorage.setItem(HOME_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          siteAssets: assetsMap
        }));
      } catch (error) {
        // no-op if storage is unavailable
      }
    };

    const fetchHomeData = async () => {
      getCached(`/site-assets/hero_background`, { timeout: 2500, cacheTtlMs: 300000 })
        .then((heroRes) => {
          if (!isMounted) return;
          const heroUrl = heroRes?.data?.asset_url;
          if (heroUrl) {
            localStorage.setItem(PERMANENT_HERO_KEY, heroUrl);
            setSiteAssets((prev) => ({ ...prev, hero_background: heroUrl }));
          }
        })
        .catch(() => {
          // fallback to full site-assets payload below
        });

      getCached(`/site-assets`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 })
        .then((assetsRes) => {
          if (!isMounted) return;
          const assetsMap = {};
          (assetsRes.data.assets || []).forEach((a) => { assetsMap[a.asset_key] = a.asset_url; });
          if (assetsMap.hero_background) {
            localStorage.setItem(PERMANENT_HERO_KEY, assetsMap.hero_background);
          }
          setSiteAssets(assetsMap);
          cacheSiteAssets(assetsMap);
        })
        .catch((error) => {
          console.error('Failed to fetch site assets:', error);
        });

      const criticalRequests = await Promise.allSettled([
        getCached(`/stats`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 120000 }),
        getCached(`/locations`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 })
      ]);

      if (!isMounted) return;

      const [statsRes, locationsRes] = criticalRequests;

      if (statsRes.status === 'fulfilled') {
        setStats(normalizeStats(statsRes.value.data));
      } else {
        console.error('Failed to fetch stats:', statsRes.reason);
      }

      if (locationsRes.status === 'fulfilled') {
        setLocations(ensureArray(locationsRes.value.data));
      } else {
        console.error('Failed to fetch locations:', locationsRes.reason);
      }

      const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 120));
      schedule(() => {
        Promise.allSettled([
          getCached(`/pillars`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 }),
          getCached(`/success-stories?limit=3`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 180000 })
        ]).then((deferredRequests) => {
          if (!isMounted) return;
          const [pillarsRes, storiesRes] = deferredRequests;

          if (pillarsRes.status === 'fulfilled') {
            setPillars(ensureArray(pillarsRes.value.data));
          } else {
            console.error('Failed to fetch pillars:', pillarsRes.reason);
          }

          if (storiesRes.status === 'fulfilled') {
            setSuccessStories(ensureArray(storiesRes.value.data));
          } else {
            console.error('Failed to fetch success stories:', storiesRes.reason);
          }

        });
      });
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!siteAssets?.hero_background) return;

    const preloadImage = new Image();
    preloadImage.src = siteAssets.hero_background;
  }, [siteAssets]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    if (reducedMotion) return;

    let cleanup = () => {};

    const runHomeAnimations = async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

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

      cleanup = () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    };

    runHomeAnimations();

    return () => {
      cleanup();
    };
  }, [stats]);

  const partnerCards = partners.length > 0
    ? partners
    : pillars.filter((pillar) => pillar.image_url).slice(0, 3);
  const teamPillarCards = teamPillars.length > 0
    ? teamPillars
    : pillars.filter((pillar) => !isPartner(pillar) && pillar.image_url).slice(0, 3);
  usePillarScrollAnimation(`home-pillars-${teamPillarCards.length}`);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero Section - keeps dark overlay for image visibility */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 px-6"
        style={{
          background: 'linear-gradient(135deg, #0B1F3A 0%, #163455 100%)'
        }}
        data-testid="hero-section"
      >
        {siteAssets.hero_background && (
          <img
            src={siteAssets.hero_background}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        )}

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
            className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-none mb-6 hero-title"
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
              className="px-8 py-4 border-2 text-sm font-medium tracking-[0.1em] uppercase transition-all rounded"
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
                className="text-center district-pill card-elevated hover-lift rounded-xl p-5"
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



      {/* Impact Stats */}
      <section ref={statsRef} id="impact" className="impact-dashboard-section py-24 sm:py-28 px-6 reveal-section" data-testid="impact-stats-section">
        <div className="impact-dashboard-bg" aria-hidden="true">
          <img
            src="https://res.cloudinary.com/datcgiuci/image/upload/f_auto,q_auto,w_2000/v1779450400/lives_thced_pinuwy.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="impact-dashboard-bg-image"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-center mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Our <span className="text-gradient-blue">Impact</span>
          </h2>
          <p className="text-center text-base sm:text-lg max-w-3xl mx-auto mb-14" style={{ color: 'var(--text-muted)' }}>Transforming lives across communities with healthcare, dignity, and sustained hope.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div
              className="impact-dashboard-card impact-stat-card"
              data-testid="stat-patients"
            >
              <div className="impact-icon-badge impact-icon-teal"><Users style={{ color: 'var(--accent-teal)' }} size={30} /></div>
              <div className="stat-number impact-stat-number" data-value={stats.patients_served} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="impact-stat-label" style={{ color: 'var(--accent-teal)' }}>Lives Touched</p>
            </div>

            <div
              className="impact-dashboard-card impact-stat-card"
              data-testid="stat-districts"
            >
              <div className="impact-icon-badge impact-icon-gold"><MapPin style={{ color: 'var(--accent-gold)' }} size={30} /></div>
              <div className="stat-number impact-stat-number" data-value={stats.districts_covered} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="impact-stat-label" style={{ color: 'var(--accent-gold)' }}>Districts Covered</p>
            </div>

            <div
              className="impact-dashboard-card impact-stat-card"
              data-testid="stat-donations"
            >
              <div className="impact-icon-badge impact-icon-teal"><Heart style={{ color: 'var(--accent-teal)' }} size={30} /></div>
              <div className="stat-number impact-stat-number" data-value={stats.total_donations} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="impact-stat-label" style={{ color: 'var(--accent-teal)' }}>Donations Received</p>
            </div>

            <div
              className="impact-dashboard-card impact-stat-card"
              data-testid="stat-amount"
            >
              <div className="impact-icon-badge impact-icon-gold"><TrendingUp style={{ color: 'var(--accent-gold)' }} size={30} /></div>
              <div className="stat-number impact-stat-number" data-value={stats.total_amount} style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                0
              </div>
              <p className="impact-stat-label" style={{ color: 'var(--accent-gold)' }}>Total Raised (INR)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section
        className="py-20 px-6 reveal-section"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6, 20, 38, 0.22), rgba(6, 20, 38, 0.22)), url('https://res.cloudinary.com/datcgiuci/image/upload/v1779448651/ChatGPT_Image_May_22_2026_04_46_50_PM_bb7zbd.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        data-testid="success-stories-section"
      >
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-14"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: '#ffffff' }}
            >
              Stories of <span style={{ color: '#ffffff' }}>Hope</span>
            </h2>

            {successStories.length > 0 ? (
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
            ) : (
              <div className="card-elevated p-8 rounded-lg text-center max-w-3xl mx-auto">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Stories of Hope will appear here soon.
                </p>
              </div>
            )}
          </div>
        </section>

      {/* Team Section */}
      <section className="py-20 px-6 reveal-section" data-testid="home-team-section">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-14"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
          >
            Our <span className="text-gradient-blue">Team</span>
          </h2>

          <div className="mt-16" data-testid="home-team-pillars-section">
            <h3 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-gold">Pillars</span>
            </h3>
            {teamPillarCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 team-pillars-drop-grid">
                {teamPillarCards.map((pillar) => (
                  <div key={pillar.id} className="card-elevated p-5 rounded-lg hover-lift text-center pop-card-lr pillar-card" data-testid={`home-pillar-${pillar.id}`}>
                    {pillar.image_url && (
                      <div className="w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full border blue-border">
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
                    <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2" style={{ color: 'var(--accent-gold)' }}>{pillar.role}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 partners-animated-grid">
                {partnerCards.map((partner) => (
                  <div key={partner.id} className="card-elevated p-5 rounded-lg hover-lift text-center partner-card home-people-card" data-testid={`partner-${partner.id}`}>
                    {partner.image_url && (
                      <div className="w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full border blue-border">
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
                    <p className="text-xs tracking-[0.15em] uppercase font-medium mb-2" style={{ color: 'var(--accent-teal)' }}>{partner.role}</p>
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
