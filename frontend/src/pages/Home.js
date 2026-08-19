import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MapPin, HandCoins, FolderCheck, ArrowRight, Heart,
  Stethoscope, BookOpen, PackageOpen, HandHeart, Mail, Phone,
  ShieldCheck, ReceiptText, ScrollText, FileCheck2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaharashtraMap from '@/components/MaharashtraMap';
import HeroLedger from '@/components/HeroLedger';
import { getCached } from '@/lib/apiClient';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import '@/styles/home.css';

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
const STATS_CACHE_KEY = 'uhf_stats_cache_v1';
// The API is hosted on a tier that sleeps when idle; waking it measures ~45s.
// A 15s timeout aborted that request and left the impact stats at zero, so the
// first visitor after an idle period saw "0 Lives Touched".
const REQUEST_TIMEOUT_MS = 60000;
const HOME_CACHE_TTL_MS = 30 * 60 * 1000;
// Stats are kept for a day: showing yesterday's real numbers is far better than
// showing zeros while the backend wakes up.
const STATS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const FALLBACK_HERO =
  'https://res.cloudinary.com/datcgiuci/image/upload/f_auto,q_auto,w_1600/v1779450400/lives_thced_pinuwy.jpg';

const readCachedStats = () => {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isFresh = parsed?.timestamp && (Date.now() - parsed.timestamp) < STATS_CACHE_TTL_MS;
    if (!isFresh || !parsed?.stats) return null;

    return parsed.stats;
  } catch (error) {
    return null;
  }
};

const writeCachedStats = (stats) => {
  try {
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), stats }));
  } catch (error) {
    // no-op if storage is unavailable
  }
};

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

// Indian readers scan large rupee figures in lakhs and crores rather than
// millions, so 131019 reads as "1.31L" and not "131K".
const formatIndianCompact = (value) => {
  const amount = toNumber(value);
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return amount.toLocaleString('en-IN');
};

// Projects carry a free-text category rather than a fixed enum, so the icon is
// matched on keywords and falls back to a neutral one.
const iconForCategory = (category = '') => {
  const value = category.toString().toLowerCase();
  if (value.includes('health') || value.includes('medical') || value.includes('camp')) return Stethoscope;
  if (value.includes('education') || value.includes('school') || value.includes('student')) return BookOpen;
  if (value.includes('disaster') || value.includes('relief') || value.includes('flood')) return PackageOpen;
  return HandHeart;
};

// Category tints for icon badges and date chips. All four carry white glyphs at
// 3:1 or better, and stay within the teal/clay family so the cards read as one
// set rather than four unrelated colours.
const CATEGORY_TINTS = ['#0E5C6B', '#BC5318', '#3F6B57', '#6B4E7D'];

const Home = () => {
  // null means "not known yet" so the UI can show a placeholder rather than
  // zeros, which read as "this charity has achieved nothing".
  const [stats, setStats] = useState(() => readCachedStats());
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [siteAssets, setSiteAssets] = useState(() => readCachedSiteAssets());
  const [pillars, setPillars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [gallery, setGallery] = useState([]);
  // Which project card is currently hovered or focused. Its photograph expands
  // to fill the section behind the grid; null means no card is engaged.
  const [activeProject, setActiveProject] = useState(null);
  const hasStats = stats !== null;
  const displayStats = stats || {
    patients_served: 0,
    districts_covered: 0,
    total_donations: 0,
    total_amount: 0
  };

  const normalizeText = (value) => (value || '').toString().trim().toLowerCase();
  const isPartner = (pillar) => {
    const category = normalizeText(pillar?.category);
    const role = normalizeText(pillar?.role);
    const name = normalizeText(pillar?.name);
    return category.startsWith('partner') || role.includes('partner') || name.includes('partner');
  };
  const partnerCards = pillars.filter((pillar) => isPartner(pillar));
  const teamPillarCards = pillars.filter((pillar) => !isPartner(pillar));

  const fallbackLocations = ['Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani'];
  const visibleLocations = locations.length > 0 ? locations : fallbackLocations.map((name) => ({ name }));

  const featuredProjects = projects.filter((project) => project.is_active !== false).slice(0, 4);
  const latestUpdates = events.slice(0, 3);

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
        getCached(`/locations`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 }),
        getCached(`/projects?active_only=true`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 }),
        // The hero slideshow is above the fold, so the gallery is fetched with
        // the critical set rather than deferred.
        getCached(`/gallery`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 })
      ]);

      if (!isMounted) return;

      const [statsRes, locationsRes, projectsRes, galleryRes] = criticalRequests;

      if (galleryRes.status === 'fulfilled') {
        setGallery(ensureArray(galleryRes.value.data));
      } else {
        console.error('Failed to fetch gallery:', galleryRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        const freshStats = normalizeStats(statsRes.value.data);
        setStats(freshStats);
        writeCachedStats(freshStats);
      } else {
        // Keep whatever was restored from cache rather than falling back to zeros.
        console.error('Failed to fetch stats:', statsRes.reason);
      }

      if (locationsRes.status === 'fulfilled') {
        setLocations(ensureArray(locationsRes.value.data));
      } else {
        console.error('Failed to fetch locations:', locationsRes.reason);
      }

      if (projectsRes.status === 'fulfilled') {
        setProjects(ensureArray(projectsRes.value.data));
      } else {
        console.error('Failed to fetch projects:', projectsRes.reason);
      }

      // The `timeout` option is not optional in practice: a bare
      // requestIdleCallback never fires while the tab is hidden, so a visitor who
      // opens the site in a background tab — or switches away before the page
      // settles — would never see the team, partners, stories or events sections
      // at all. With a deadline the browser must run the callback regardless.
      const schedule = window.requestIdleCallback
        ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 })
        : (cb) => setTimeout(cb, 120);
      schedule(() => {
        Promise.allSettled([
          getCached(`/pillars`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 300000 }),
          getCached(`/success-stories?limit=3`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 180000 }),
          getCached(`/events`, { timeout: REQUEST_TIMEOUT_MS, cacheTtlMs: 180000 })
        ]).then((deferredRequests) => {
          if (!isMounted) return;
          const [pillarsRes, storiesRes, eventsRes] = deferredRequests;

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

          if (eventsRes.status === 'fulfilled') {
            setEvents(ensureArray(eventsRes.value.data));
          } else {
            console.error('Failed to fetch events:', eventsRes.reason);
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

      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: heroYOffset },
          { opacity: 1, y: 0, duration: isSmallScreen ? 0.8 : 1.1, ease: 'power2.out' }
        );
      }

      // Read `stats` directly rather than the derived hasStats/displayStats: those
      // are recomputed every render, and naming them here would put a new object
      // in this effect's dependency list on each pass.
      if (statsRef.current && stats && stats.patients_served > 0) {
        const statElements = statsRef.current.querySelectorAll('.stat-number');

        statElements.forEach((element) => {
          const finalValue = parseInt(element.dataset.value, 10);
          if (!Number.isFinite(finalValue)) return;
          const suffix = element.dataset.suffix || '';

          ScrollTrigger.create({
            trigger: statsRef.current,
            start: 'top 75%',
            onEnter: () => {
              // fromTo, not to: the markup renders the real figure, so the tween
              // has to reset to zero before counting up. With gsap.to the start
              // and end values would be identical and nothing would move.
              gsap.fromTo(
                element,
                { innerText: 0 },
                {
                  innerText: finalValue,
                  duration: 1.8,
                  snap: { innerText: 1 },
                  ease: 'power2.out',
                  onUpdate: function () {
                    const current = Math.ceil(this.targets()[0].innerText);
                    element.innerText = `${current.toLocaleString('en-IN')}${suffix}`;
                  }
                }
              );
            },
            once: true
          });
        });
      }

      // Repeated items arrive one after another rather than as one block. A
      // whole section fading in at once reads as a page still loading; the
      // same content staggered reads as it arriving, which is the difference
      // between the two on any well-made site.
      const STAGGER_ITEMS = [
        '.work-card', '.person-card', '.story-card-v2', '.update-card',
        '.impact-item', '.trust-card', '.contact-card', '.home-district-list li'
      ].join(', ');

      gsap.utils.toArray('.reveal-section').forEach((section) => {
        const items = Array.from(section.querySelectorAll(STAGGER_ITEMS));

        if (items.length > 1) {
          // Where a section has a run of items, the heading leads and the items
          // follow it in. Fading the section as well would flatten the stagger
          // back into a single block, so it is deliberately left alone.
          const head = section.querySelector('.home-section-head, .home-eyebrow, .home-section-title');
          if (head) {
            gsap.fromTo(
              head,
              { opacity: 0, y: yOffset * 0.5 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: { trigger: section, start: 'top 85%', once: true }
              }
            );
          }

          gsap.fromTo(
            items,
            { opacity: 0, y: yOffset * 0.62 },
            {
              opacity: 1,
              y: 0,
              duration: 0.62,
              ease: 'power2.out',
              // 70ms apart: below about 50 the run reads as one event, above
              // about 100 the last card is visibly late.
              stagger: isSmallScreen ? 0.05 : 0.07,
              scrollTrigger: { trigger: section, start: 'top 80%', once: true }
            }
          );
          return;
        }

        gsap.fromTo(
          section,
          { opacity: 0, y: yOffset },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 85%', once: true }
          }
        );
      });

      cleanup = () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };

    runHomeAnimations();

    return () => cleanup();
  }, [stats]);

  const heroImage = siteAssets?.hero_background || FALLBACK_HERO;

  const impactCards = [
    {
      id: 'stat-patients',
      Icon: Users,
      value: displayStats.patients_served,
      display: displayStats.patients_served.toLocaleString('en-IN'),
      suffix: '+',
      label: 'Lives Touched'
    },
    {
      id: 'stat-projects',
      Icon: FolderCheck,
      value: projects.length,
      display: projects.length.toLocaleString('en-IN'),
      suffix: '+',
      label: 'Projects Completed'
    },
    {
      id: 'stat-districts',
      Icon: MapPin,
      value: displayStats.districts_covered,
      display: displayStats.districts_covered.toLocaleString('en-IN'),
      suffix: '+',
      label: 'Districts Covered'
    },
    {
      id: 'stat-amount',
      Icon: HandCoins,
      value: displayStats.total_amount,
      display: `₹${formatIndianCompact(displayStats.total_amount)}`,
      suffix: '+',
      label: 'Funds Utilized',
      // Lakh/crore shorthand cannot be produced by a numeric tween, so this one
      // renders its formatted value directly instead of counting up.
      staticValue: true
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="home-hero home-hero-ledger" data-testid="hero-section">
        <HeroLedger slides={gallery} fallbackImage={heroImage} />

        <div className="home-hero-inner" ref={heroRef}>
          <div className="home-hero-copy">
            <p className="home-eyebrow">Registered public trust · Maharashtra</p>
            <h1 className="home-hero-title">
              Every rupee,
              <br />
              <span className="home-hero-title-accent">accounted for.</span>
            </h1>
            <p className="home-hero-lede">
              Home-based palliative care, elderly care and medical camps across rural
              Maharashtra — with the books open on every one of them.
            </p>

            <div className="home-hero-actions">
              <Link to="/donate" className="btn-primary-clay" data-testid="hero-donate-button">
                Donate Now <Heart size={18} aria-hidden="true" />
              </Link>
              <Link to="/transparency" className="btn-primary-green" data-testid="hero-explore-button">
                See The Numbers <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Every figure here is read from the API rather than written into
              the page, so the ledger cannot drift out of date. */}
          <div className="ledger-figures" data-testid="ledger-figures">
            <div className="ledger-cell">
              <span className="ledger-value">
                {hasStats ? displayStats.patients_served.toLocaleString('en-IN') : '—'}
              </span>
              <span className="ledger-label">Lives touched</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-value">{visibleLocations.length}</span>
              <span className="ledger-label">Districts</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-value">
                {hasStats ? formatIndianCompact(displayStats.total_amount) : '—'}
              </span>
              <span className="ledger-label">Deployed</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-value">
                {hasStats ? displayStats.total_donations.toLocaleString('en-IN') : '—'}
              </span>
              <span className="ledger-label">Donations received</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Our Work */}
      <section
        className={`home-section home-work-section reveal-section${activeProject ? ' is-immersive' : ''}`}
        data-testid="our-work-section"
      >
        {/* Every featured photograph is mounted up front and cross-faded by
            opacity. Swapping a single src on hover would show a blank frame
            while the larger image downloaded. */}
        <div className="work-backdrop" aria-hidden="true">
          {featuredProjects.map((project) => (
            project.hero_image ? (
              <img
                key={`backdrop-${project.id}`}
                src={optimizeCloudinaryUrl(project.hero_image, { width: 1600 })}
                alt=""
                loading="lazy"
                decoding="async"
                className={`work-backdrop-image${activeProject === project.id ? ' is-active' : ''}`}
              />
            ) : null
          ))}
          <div className="work-backdrop-scrim" />
        </div>

        <div className="home-container home-work-content">
          <div className="home-section-head">
            <div>
              <h2 className="home-section-title">
                Our <span className="home-title-accent">Work</span>
              </h2>
              <p className="home-section-sub">Real work. Real communities. Real impact.</p>
            </div>
            <Link to="/projects" className="btn-ghost-green" data-testid="view-all-projects">
              View All Projects <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {featuredProjects.length > 0 ? (
            <div className="home-work-grid">
              {featuredProjects.map((project, index) => {
                const Icon = iconForCategory(project.category);
                const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length];
                return (
                  <article
                    key={project.id}
                    className={`work-card${activeProject === project.id ? ' is-active' : ''}`}
                    data-testid={`work-card-${project.id}`}
                    onMouseEnter={() => setActiveProject(project.id)}
                    onMouseLeave={() => setActiveProject((current) => (current === project.id ? null : current))}
                    // Focus mirrors hover so the effect is reachable by keyboard.
                    onFocus={() => setActiveProject(project.id)}
                    onBlur={() => setActiveProject((current) => (current === project.id ? null : current))}
                  >
                    <div className="work-card-media">
                      {project.hero_image ? (
                        <img
                          src={optimizeCloudinaryUrl(project.hero_image, { width: 600 })}
                          alt={project.title}
                          width="600"
                          height="400"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="work-card-media-empty" aria-hidden="true" />
                      )}
                      <span className="work-card-badge" style={{ background: tint }}>
                        <Icon size={20} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="work-card-body">
                      <h3 className="work-card-title">{project.title}</h3>
                      {project.category && (
                        <p className="work-card-meta">
                          <MapPin size={13} aria-hidden="true" /> {project.category}
                        </p>
                      )}
                      <p className="work-card-text">{project.description}</p>
                      <Link to={`/projects/${project.slug || project.id}`} className="work-card-link">
                        View Project <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="home-empty">Our current projects will be listed here shortly.</p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ About Us */}
      <section className="home-section home-section-alt reveal-section" data-testid="about-section">
        <div className="home-container home-about">
          <div className="home-about-media">
            <img
              src={optimizeCloudinaryUrl(heroImage, { width: 900 })}
              alt="United Hands Foundation volunteers working with a community in Maharashtra"
              width="900"
              height="700"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="home-about-copy">
            <p className="home-eyebrow">About Us</p>
            <h2 className="home-section-title">
              Who We <span className="home-title-accent">Are</span>
            </h2>
            <p className="home-about-lede">
              United Hands Foundation is a registered charitable society working alongside
              communities across Maharashtra since 2020. We work in healthcare, education,
              disaster relief and elderly care &mdash; not as one-off charity, but as sustained
              presence in the districts we serve.
            </p>
            <p className="home-about-text">
              Every rupee is accounted for and every programme is run with the people it
              serves, not merely for them. Our registration details and governance documents
              are published openly.
            </p>

            <ul className="home-about-points">
              <li><ShieldCheck size={18} aria-hidden="true" /> Registered charitable society since 2020</li>
              <li><ReceiptText size={18} aria-hidden="true" /> 80G tax exemption for Indian donors</li>
              <li><ScrollText size={18} aria-hidden="true" /> Governance documents published publicly</li>
            </ul>

            <div className="home-about-actions">
              <Link to="/about" className="btn-primary-green" data-testid="about-learn-more">
                Learn More About Us <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/transparency" className="btn-ghost-green" data-testid="about-transparency">
                View Transparency <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Our Impact */}
      <section
        ref={statsRef}
        id="impact"
        className="home-impact reveal-section"
        data-testid="impact-stats-section"
      >
        <div className="home-container">
          <h2 className="home-section-title home-impact-title">Our Impact</h2>
          <p className="home-impact-sub">Together, we are creating measurable change.</p>

          <div className="home-impact-grid">
            {impactCards.map(({ id, Icon, value, display, suffix, label, staticValue }) => (
              <div key={id} className="impact-item" data-testid={id}>
                <span className="impact-item-icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                {hasStats ? (
                  // Render the real figure rather than a hardcoded 0. The count-up
                  // tween resets this to zero itself when it runs, so a visitor
                  // with reduced-motion enabled still sees the correct number.
                  <div
                    className={staticValue ? 'impact-item-value' : 'stat-number impact-item-value'}
                    data-value={value}
                    data-suffix={suffix}
                  >
                    {display}{suffix}
                  </div>
                ) : (
                  <div className="impact-item-value" aria-label={`Loading ${label}`}>
                    <span className="impact-skeleton animate-pulse" />
                  </div>
                )}
                <p className="impact-item-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------- Latest From Our Work */}
      {latestUpdates.length > 0 && (
        <section className="home-section reveal-section" data-testid="latest-updates-section">
          <div className="home-container">
            <div className="home-section-head">
              <div>
                <h2 className="home-section-title">
                  Latest From <span className="home-title-accent">Our Work</span>
                </h2>
              </div>
              <Link to="/events" className="btn-ghost-green" data-testid="view-all-updates">
                View All Updates <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="home-updates-grid">
              {latestUpdates.map((event, index) => {
                const eventDate = event.date ? new Date(event.date) : null;
                const validDate = eventDate && !Number.isNaN(eventDate.getTime());
                const tint = CATEGORY_TINTS[index % CATEGORY_TINTS.length];
                return (
                  <article key={event.id} className="update-card" data-testid={`update-card-${event.id}`}>
                    <div className="update-card-media">
                      {event.images && event.images[0] ? (
                        <img
                          src={optimizeCloudinaryUrl(event.images[0], { width: 600 })}
                          alt={event.title}
                          width="600"
                          height="400"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="work-card-media-empty" aria-hidden="true" />
                      )}
                      {validDate && (
                        <span className="update-card-date" style={{ background: tint }}>
                          <strong>{eventDate.toLocaleDateString('en-IN', { day: '2-digit' })}</strong>
                          <em>{eventDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</em>
                        </span>
                      )}
                    </div>
                    <div className="work-card-body">
                      <h3 className="work-card-title">{event.title}</h3>
                      <p className="work-card-text">{event.description}</p>
                      <Link to={`/events/${event.slug}`} className="work-card-link">
                        Read More <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------- Where We Work  +  Who We Are */}
      <section className="home-section home-section-alt reveal-section" data-testid="where-we-work-section">
        <div className="home-container home-split">
          <div className="home-split-card">
            <h2 className="home-split-title">
              Where We <span className="home-title-accent">Work</span>
            </h2>
            <div className="home-map-row">
              <MaharashtraMap locations={visibleLocations} className="home-map" />
              <ul className="home-district-list">
                {visibleLocations.map((location) => (
                  <li key={location.name}>
                    <MapPin size={15} aria-hidden="true" />
                    <span>
                      <strong>{location.name}</strong>
                      <em>Maharashtra</em>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------- Success Stories */}
      <section className="home-section reveal-section" data-testid="success-stories-section">
        <div className="home-container">
          <p className="home-eyebrow home-eyebrow-center">Voices From The Field</p>
          <h2 className="home-section-title home-section-title-center">
            Stories of <span className="home-title-accent">Hope</span>
          </h2>

          {successStories.length > 0 ? (
            <div className="home-stories-grid">
              {successStories.map((story, idx) => (
                <article
                  key={story.id}
                  className="story-card-v2"
                  style={{ borderTopColor: CATEGORY_TINTS[idx % CATEGORY_TINTS.length] }}
                  data-testid={`story-${story.id}`}
                >
                  <span className="story-card-quote" aria-hidden="true">&ldquo;</span>
                  <p className="story-card-text">{story.story_text}</p>
                  <div className="story-card-foot">
                    <span className="story-chip"><MapPin size={13} aria-hidden="true" />{story.location}</span>
                    <div className="story-card-meta">
                      <strong>{story.patient_count} beneficiaries</strong>
                      <span>{new Date(story.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-empty">Stories from the communities we serve will appear here soon.</p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------- Team & Partners */}
      {(teamPillarCards.length > 0 || partnerCards.length > 0) && (
        <section className="home-section home-section-alt reveal-section" data-testid="home-team-section">
          <div className="home-container">
            {teamPillarCards.length > 0 && (
              <div data-testid="home-team-pillars-section">
                <p className="home-eyebrow home-eyebrow-center">The People Behind The Mission</p>
                <h2 className="home-section-title home-section-title-center">
                  Our <span className="home-title-accent">Team</span>
                </h2>
                <div className="home-people-grid">
                  {teamPillarCards.map((pillar) => (
                    <div key={pillar.id} className="person-card" data-testid={`home-pillar-${pillar.id}`}>
                      {pillar.image_url && (
                        <div className="person-card-photo">
                          <img
                            src={optimizeCloudinaryUrl(pillar.image_url, { width: 240 })}
                            alt={pillar.name}
                            width="240"
                            height="240"
                            loading="lazy"
                            decoding="async"
                            className="identity-lock"
                          />
                        </div>
                      )}
                      <h3 className="person-card-name">{pillar.name}</h3>
                      <p className="person-card-role">{pillar.role}</p>
                      {pillar.specialty && <p className="person-card-note">{pillar.specialty}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {partnerCards.length > 0 && (
              <div className="home-partners-block" data-testid="home-partners-section">
                <h2 className="home-section-title home-section-title-center">
                  Our <span className="home-title-accent">Partners</span>
                </h2>
                <div className="home-people-grid">
                  {partnerCards.map((partner) => (
                    <div key={partner.id} className="person-card" data-testid={`partner-${partner.id}`}>
                      {partner.image_url && (
                        <div className="person-card-photo person-card-photo-partner">
                          <img
                            src={optimizeCloudinaryUrl(partner.image_url, { width: 240 })}
                            alt={partner.name}
                            width="240"
                            height="240"
                            loading="lazy"
                            decoding="async"
                            className="identity-lock"
                          />
                        </div>
                      )}
                      <h3 className="person-card-name">{partner.name}</h3>
                      <p className="person-card-role person-card-role-partner">{partner.role}</p>
                      {partner.specialty && <p className="person-card-note">{partner.specialty}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- Credentials */}
      {/* Replaces the scrolling masthead strip. A row of outlet names carries no
          evidence and reads as decoration; registration numbers are checkable
          facts, which is what actually reassures someone about to donate. */}
      <section className="home-trust reveal-section" data-testid="credentials-section">
        <div className="home-container">
          <p className="home-eyebrow home-eyebrow-center">Registered &amp; Accountable</p>
          <h2 className="home-section-title home-section-title-center">
            Your Donation Is <span className="home-title-accent">Protected</span>
          </h2>
          <p className="home-section-sub home-section-sub-center">
            United Hands Foundation is a registered charitable society. Every credential below
            can be verified with the issuing authority.
          </p>

          <div className="home-trust-grid">
            {[
              { Icon: ScrollText, label: 'Societies Registration', value: 'Latur/171/2020', note: 'Registered 04 Aug 2020' },
              { Icon: ReceiptText, label: '80G Tax Exemption', value: 'AABTU0797KF20231', note: 'Donations are tax deductible' },
              { Icon: FileCheck2, label: '12A Registration', value: 'AABTU0797KE20231', note: 'Recognised charitable trust' },
              { Icon: ShieldCheck, label: 'PAN', value: 'AABTU0797K', note: 'Verified entity' }
            ].map(({ Icon, label, value, note }) => (
              <div key={label} className="trust-card" data-testid={`trust-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <span className="trust-card-icon"><Icon size={22} aria-hidden="true" /></span>
                <p className="trust-card-label">{label}</p>
                <p className="trust-card-value">{value}</p>
                <p className="trust-card-note">{note}</p>
              </div>
            ))}
          </div>

          <div className="home-trust-actions">
            <Link to="/transparency" className="btn-ghost-green" data-testid="trust-transparency">
              See Our Governance Documents <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/press" className="btn-ghost-green" data-testid="trust-press">
              Read Press Coverage <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CTA band */}
      <section className="home-cta reveal-section" data-testid="cta-section">
        <div className="home-container home-cta-inner">
          <span className="home-cta-icon" aria-hidden="true">
            <HandHeart size={40} />
          </span>
          <div className="home-cta-copy">
            <h2 className="home-cta-title">Together, We Can Do More</h2>
            <p className="home-cta-text">
              Your support helps us reach more lives and build a brighter future.
            </p>
          </div>
          <Link to="/donate" className="btn-primary-clay" data-testid="cta-donate-button">
            Donate Now <Heart size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- Contact */}
      <section id="contact" className="home-section reveal-section" data-testid="contact-section">
        <div className="home-container">
          <h2 className="home-section-title home-section-title-center">Get in Touch</h2>
          <p className="home-section-sub home-section-sub-center">
            Questions, partnerships, or a helping hand &mdash; we&rsquo;re one message away.
          </p>
          <div className="home-contact-grid">
            <a className="contact-card" href="mailto:Uniteduhf@gmail.com">
              <span className="contact-card-icon"><Mail size={20} aria-hidden="true" /></span>
              <strong>Email Us</strong>
              <span>Uniteduhf@gmail.com</span>
            </a>
            <a className="contact-card" href="tel:+919730267630">
              <span className="contact-card-icon"><Phone size={20} aria-hidden="true" /></span>
              <strong>Call Us</strong>
              <span>+91 9730267630</span>
            </a>
            <div className="contact-card">
              <span className="contact-card-icon"><MapPin size={20} aria-hidden="true" /></span>
              <strong>Visit Us</strong>
              <span>Bhoi Galli, Latur, Maharashtra</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
