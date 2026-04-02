import { useState, useEffect, useMemo } from 'react';
import { MapPin, Heart, Users, Award, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';
import usePillarScrollAnimation from '@/hooks/usePillarScrollAnimation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const AboutUs = () => {
  const [siteAssets, setSiteAssets] = useState({});
  const [pillars, setPillars] = useState([]);
  const [locations, setLocations] = useState([]);
  const normalizeCategory = (category) => (category || '').toString().trim().toLowerCase();
  const isPartner = (category) => normalizeCategory(category).startsWith('partner');
  const teamPillars = pillars.filter((pillar) => !isPartner(pillar.category));
  const partners = pillars.filter((pillar) => isPartner(pillar.category));
  const founders = useMemo(() => ([
    siteAssets.founder_1 ? {
      key: 'founder-1',
      image: siteAssets.founder_1,
      alt: 'Dr. Rahul Sarwade',
      name: 'Dr. Rahul Sarwade',
      title: 'Co-Founder & President',
      description: `Former Government of India medical officer with decades of healthcare expertise.
Dedicated to extending medical access to rural Maharashtra's most underserved populations.`
    } : null,
    siteAssets.founder_2 ? {
      key: 'founder-2',
      image: siteAssets.founder_2,
      alt: 'Dr. Jagruti Hankare',
      name: 'Dr. Jagruti Hankare',
      title: 'Co-Founder & Secretary',
      description: `Healthcare professional committed to improving quality of life for underserved communities
through medical camps, health awareness drives, and community outreach programs.`
    } : null
  ].filter(Boolean)), [siteAssets.founder_1, siteAssets.founder_2]);
  const fallbackLocations = [
    { name: 'Dharashiv', description: 'Medical camps & elderly care' },
    { name: 'Solapur', description: 'Education & health awareness' },
    { name: 'Latur', description: 'Headquarters & community hub' },
    { name: 'Palghar', description: 'Tribal healthcare outreach' },
    { name: 'Panchgani', description: 'Rural health programs' }
  ];
  const visibleLocations = locations.length > 0 ? locations : fallbackLocations;

  usePageRevealAnimation(`${pillars.length}-${partners.length}-${visibleLocations.length}`);
  usePillarScrollAnimation(`about-${teamPillars.length}`);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${API}/site-assets`);
        const map = {};
        (response.data.assets || []).forEach(a => { map[a.asset_key] = a.asset_url; });
        setSiteAssets(map);
      } catch (error) { console.error('Failed to fetch assets:', error); }
    };
    const fetchPillars = async () => {
      try {
        const response = await axios.get(`${API}/pillars`);
        setPillars(response.data);
      } catch (error) { console.error('Failed to fetch pillars:', error); }
    };
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API}/locations`);
        setLocations(Array.isArray(response.data) ? response.data : []);
      } catch (error) { console.error('Failed to fetch locations:', error); }
    };
    fetchAssets();
    fetchPillars();
    fetchLocations();
  }, []);


  useEffect(() => {
    const foundersSection = document.querySelector('[data-testid="about-founders"]');
    if (!foundersSection) return undefined;

    const founderElements = foundersSection.querySelectorAll('[data-testid^="about-founder-"]');
    if (!founderElements.length) return undefined;

    founderElements.forEach((element, index) => {
      element.classList.add('pillar-hidden');
      element.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('pillar-show');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    founderElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [founders.length]);


  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 reveal-section" data-testid="about-hero">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight mb-6 text-gradient-gold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            About Us
          </h1>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            United Hands Foundation is a registered non-profit committed to healthcare,
            education, disaster relief, and community upliftment across Maharashtra since 2020.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-mission">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card-elevated p-10 rounded-lg">
            <Target className="mb-6" style={{ color: 'var(--accent-teal)' }} size={40} />
            <h2 className="text-3xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-blue">Mission</span>
            </h2>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
              {`To unite hands and hearts in serving underserved communities through integrated
programs in healthcare, elderly care, palliative support, education, and livelihood.
To ensure accessible, affordable, and holistic health services in both rural and tribal
areas.
To empower women, youth, and marginalized groups through skill development,
education, and livelihood opportunities.
To provide comfort, dignity, and companionship to the elderly and those in palliative
care.
To create a platform where communities actively participate in their own growth,
leading to sustainable and inclusive development`}
            </p>
          </div>
          <div className="card-elevated p-10 rounded-lg">
            <Award className="mb-6" style={{ color: 'var(--accent-gold)' }} size={40} />
            <h2 className="text-3xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-orange">Vision</span>
            </h2>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
              {`build a compassionate, healthy, and self-reliant society where every individual — from
children to the elderly — has access to dignity, care, opportunities, and hope.`}
            </p>
          </div>
        </div>
      </section>

      {/* Founder Photos - Dynamic from CMS */}
      <section className="py-16 px-6 reveal-section" data-testid="about-founders">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-medium text-center mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Our <span className="text-gradient-blue">Founders</span>
          </h2>
          <p className="text-center text-base mb-12" style={{ color: 'var(--text-muted)' }}>
            Ex-Government of India doctors serving communities with dedication
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch" data-testid="about-founders-grid">
            {founders.map((founder) => (
              <div
                key={founder.key}
                className="card-elevated rounded-lg overflow-hidden hover-lift founder-card group h-full flex flex-col"
                data-testid={`about-${founder.key}`}
              >
                <div className="h-80 overflow-hidden">
                  <img src={founder.image} alt={founder.alt} className="w-full h-full object-cover identity-lock" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{founder.name}</h3>
                  <p className="text-xs tracking-[0.15em] uppercase font-bold mb-3" style={{ color: 'var(--accent-gold)' }}>{founder.title}</p>
                  <p className="founder-description text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {founder.description}
                  </p>
                  <div className="mt-auto pt-4 founder-card-spacer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field Work Gallery from CMS */}
      {(siteAssets.hero_background || siteAssets.center_photo) && (
        <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-fieldwork">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-medium text-center mb-12" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              In the <span className="text-gradient-gold">Field</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteAssets.hero_background && (
                <div className="rounded-lg overflow-hidden hover-lift card-elevated">
                  <img src={siteAssets.hero_background} alt="Field Work" className="w-full h-72 object-cover identity-lock" />
                </div>
              )}
              {siteAssets.center_photo && (
                <div className="rounded-lg overflow-hidden hover-lift card-elevated">
                  <img src={siteAssets.center_photo} alt="Community Service" className="w-full h-72 object-cover identity-lock" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Team Pillars - Dynamic */}
      {pillars.length > 0 && (
        <section className="py-16 px-6 reveal-section" data-testid="about-pillars">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-medium text-center mb-12" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-orange">Pillars</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
              {teamPillars.map(pillar => (
                <div key={pillar.id} className="card-elevated p-8 rounded-lg hover-lift text-center pop-card-lr pillar-card h-full flex flex-col" data-testid={`about-pillar-${pillar.id}`}>
                  {pillar.image_url ? (
                    <img src={pillar.image_url} alt={pillar.name} className="w-20 h-20 rounded-full mx-auto mb-5 object-cover identity-lock" />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
                      <Users style={{ color: 'var(--accent-teal)' }} size={32} />
                    </div>
                  )}
                  <h3 className="text-xl font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{pillar.name}</h3>
                  <p className="text-xs tracking-[0.15em] uppercase font-bold mb-3" style={{ color: 'var(--accent-teal)' }}>{pillar.role}</p>
                  {pillar.specialty && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{pillar.specialty}</p>}
                  {pillar.bio_detailed && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{pillar.bio_detailed}</p>}
                </div>
              ))}
            </div>

            <div className="mt-14" data-testid="about-partners-section">
              <h3 className="text-3xl font-medium text-center mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                Our <span className="text-gradient-blue">Partners</span>
              </h3>
              {partners.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
                  {partners.map((partner) => (
                    <div key={partner.id} className="card-elevated p-8 rounded-lg hover-lift text-center partner-card group pop-card-lr" data-testid={`about-partner-${partner.id}`}>
                      {partner.image_url && (
                        <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border blue-border">
                          <img
                            src={partner.image_url}
                            alt={partner.name}
                            className="w-full h-full object-cover identity-lock"
                          />
                        </div>
                      )}
                      <h4 className="text-xl font-medium mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{partner.name}</h4>
                      <p className="text-xs tracking-[0.15em] uppercase font-bold mb-3" style={{ color: 'var(--accent-teal)' }}>{partner.role}</p>
                      {partner.specialty && <p className="partner-description text-sm" style={{ color: 'var(--text-muted)' }}>{partner.specialty}</p>}
                      {partner.bio_detailed && <p className="partner-description text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{partner.bio_detailed}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-elevated p-8 rounded-lg text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Partner profiles will appear here as soon as they are added from the dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Where We Work */}
      <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-locations">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-medium text-center mb-12" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Where We <span className="text-gradient-blue">Work</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {visibleLocations.map(loc => (
              <div key={loc.id || loc.name} className="card-elevated p-6 rounded-lg text-center hover-lift">
                <MapPin className="mx-auto mb-3" style={{ color: 'var(--accent-gold)' }} size={28} />
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{loc.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{loc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal & Registration */}
      <section className="py-16 px-6" data-testid="about-legal">
        <div className="max-w-4xl mx-auto card-elevated p-10 rounded-lg">
          <h2 className="text-3xl font-medium text-center mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Legal <span className="text-gradient-gold">Registration</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'PAN', value: 'AABTU0797K' },
              { label: '80G Certificate', value: 'AABTU0797KF20231' },
              { label: '12A Registration', value: 'AABTU0797KE20231' },
              { label: 'Society Registration', value: 'Latur/0000171/2020' },
              { label: 'Registered Date', value: '04 August 2020' },
              { label: 'Address', value: 'Ratnai Niwas, Kaikadi Chal, Bhoi Galli, Latur, MH - 413512' }
            ].map(item => (
              <div key={item.label} className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-teal)' }}>{item.label}</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-cta">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="mx-auto mb-6" style={{ color: 'var(--accent-gold)' }} size={48} fill="var(--accent-gold)" />
          <h2 className="text-4xl font-medium mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Join Our <span className="text-gradient-orange">Mission</span>
          </h2>
          <p className="text-base mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Whether through donations, volunteering, or spreading awareness — every act of
            kindness strengthens the foundation of hope we're building together.
          </p>
          <a href="/donate">
            <button className="btn-gold">Support Our Work</button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
