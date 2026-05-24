import { useState, useEffect, useMemo } from 'react';
import { MapPin, Heart, Award, Target, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';
import { getCached } from '@/lib/apiClient';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const AboutUs = () => {
  const [siteAssets, setSiteAssets] = useState({});
  const [locations, setLocations] = useState([]);
  const fallbackLocations = [
    { name: 'Dharashiv', description: 'Medical camps & elderly care' },
    { name: 'Solapur', description: 'Education & health awareness' },
    { name: 'Latur', description: 'Headquarters & community hub' },
    { name: 'Palghar', description: 'Tribal healthcare outreach' },
    { name: 'Panchgani', description: 'Rural health programs' }
  ];
  const visibleLocations = locations.length > 0 ? locations : fallbackLocations;
  const missionPoints = [
    'Serve underserved communities through healthcare, education, elderly care, and livelihood support.',
    'Make health services affordable and accessible in rural and tribal areas.',
    'Empower women, youth, and marginalized groups through skills and opportunity.',
    'Provide comfort, dignity, and companionship for elderly and palliative care beneficiaries.',
    'Build community-led solutions for sustainable and inclusive development.'
  ];

  usePageRevealAnimation(`${visibleLocations.length}`);

  const [particlesReady, setParticlesReady] = useState(false);
  const [isReducedParticleMode, setIsReducedParticleMode] = useState(false);

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    const updateReducedMode = () => {
      const touchDevice = window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
      const narrowScreen = window.innerWidth < 768;
      setIsReducedParticleMode(touchDevice || narrowScreen);
    };

    updateReducedMode();
    window.addEventListener('resize', updateReducedMode);

    return () => window.removeEventListener('resize', updateReducedMode);
  }, []);

  const missionParticleOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: {
        value: isReducedParticleMode ? 8 : 22,
        density: { enable: true, area: 1300 }
      },
      color: { value: ['#d4af37', '#f5efe6', '#84a98c'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.35 },
        random: { enable: true },
        animation: {
          enable: true,
          speed: 0.12,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: { min: 1.2, max: 4.2 },
        random: { enable: true }
      },
      move: {
        enable: true,
        speed: { min: 0.22, max: 0.58 },
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
        attract: { enable: false },
        decay: 0.03
      },
      blur: { value: 4, enable: true },
      shadow: {
        enable: true,
        color: '#f5efe6',
        blur: 12,
        offset: { x: 0, y: 0 }
      }
    },
    interactivity: {
      events: {
        onHover: { enable: !isReducedParticleMode, mode: 'attract' },
        resize: { enable: true }
      },
      modes: {
        attract: {
          distance: 140,
          duration: 0.8,
          easing: 'ease-out-quad',
          factor: 0.35,
          maxSpeed: 0.45,
          speed: 0.28
        }
      }
    },
    pauseOnBlur: true,
    pauseOnOutsideViewport: true
  }), [isReducedParticleMode]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await getCached(`/site-assets`, { cacheTtlMs: 300000 });
        const map = {};
        (response.data.assets || []).forEach(a => { map[a.asset_key] = a.asset_url; });
        setSiteAssets(map);
      } catch (error) { console.error('Failed to fetch assets:', error); }
    };
    const fetchLocations = async () => {
      try {
        const response = await getCached(`/locations`, { cacheTtlMs: 300000 });
        setLocations(Array.isArray(response.data) ? response.data : []);
      } catch (error) { console.error('Failed to fetch locations:', error); }
    };
    fetchAssets();
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 reveal-section" data-testid="about-hero">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent-teal)' }}>
              United Hands Foundation
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight mb-6 text-gradient-gold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              About Us
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
              United Hands Foundation is a registered non-profit committed to healthcare,
              education, disaster relief, and community upliftment across Maharashtra since 2020.
            </p>
          </div>
          <div className="card-elevated rounded-lg p-8">
            <h2 className="text-2xl mb-5" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              At a Glance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Founded', value: '2020' },
                { label: 'Focus Areas', value: '4+' },
                { label: 'Locations', value: `${visibleLocations.length}` },
                { label: 'Approach', value: 'Community-led' }
              ].map(item => (
                <div key={item.label} className="rounded p-4" style={{ background: 'var(--bg-surface)' }}>
                  <p className="text-xs uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--accent-teal)' }}>{item.label}</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 reveal-section relative overflow-hidden" style={{ background: 'var(--bg-surface)' }} data-testid="about-mission">
        {particlesReady && (
          <Particles
            id="mission-vision-particles"
            className="absolute inset-0 z-0 pointer-events-none"
            options={missionParticleOptions}
          />
        )}
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          <div className="rounded-2xl p-8 md:p-10 border border-white/50 bg-white/40 backdrop-blur-md shadow-[0_18px_45px_-25px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out hover:-translate-y-1" style={{ boxShadow: '0 18px 45px -25px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.45)' }}>
            <Target className="mb-6" style={{ color: 'var(--accent-teal)' }} size={40} />
            <h2 className="text-3xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-blue">Mission</span>
            </h2>
            <ul className="space-y-4">
              {missionPoints.map(point => (
                <li key={point} className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="mt-1 shrink-0" style={{ color: 'var(--accent-teal)' }} />
                  <span className="leading-relaxed font-light tracking-[0.01em]" style={{ color: 'var(--text-muted)' }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-8 md:p-10 border border-white/50 bg-white/40 backdrop-blur-md shadow-[0_18px_45px_-25px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out hover:-translate-y-1" style={{ boxShadow: '0 18px 45px -25px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.45)' }}>
            <Award className="mb-6" style={{ color: 'var(--accent-gold)' }} size={40} />
            <h2 className="text-3xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-orange">Vision</span>
            </h2>
            <p className="leading-relaxed mb-6 font-light tracking-[0.01em]" style={{ color: 'var(--text-muted)' }}>
              Build a compassionate, healthy, and self-reliant society where every individual —
              from children to the elderly — has access to dignity, care, opportunities, and hope.
            </p>
            <div className="border-l-2 pl-5 space-y-4" style={{ borderColor: 'var(--accent-gold)' }}>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Care:</span> Human-first support that protects dignity.</p>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Access:</span> Services delivered where people need them most.</p>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Impact:</span> Long-term change through local participation.</p>
            </div>
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
              { label: 'Society Registration', value: 'Latur/171/2020' },
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
