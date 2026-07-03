import { useState, useEffect } from 'react';
import { MapPin, Award, Target, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedLogo from '@/components/AnimatedLogo';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';
import { getCached } from '@/lib/apiClient';

const locationColors = ['#F5822A', '#D6472B', '#3E9B4F', '#2779BD', '#F0A500'];

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

      {/* Hero — big serif intro with image */}
      <section className="pt-20 pb-14 px-6 reveal-section" data-testid="about-hero">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs tracking-[0.25em] uppercase font-bold mb-4" style={{ color: 'var(--accent-gold)' }}>
              United Hands Foundation
            </span>
            <h1 className="text-5xl sm:text-6xl tracking-tight mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-teal)' }}>
              We Care.
            </h1>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              United Hands Foundation is a registered non-profit committed to healthcare,
              education, disaster relief, and community upliftment across Maharashtra since 2020.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              From medical camps in Dharashiv to tribal healthcare outreach in Palghar,
              our work is community-led — built with the people it serves.
            </p>
          </div>
          <div className="rounded-[2rem] overflow-hidden hover-lift" style={{ minHeight: 280 }}>
            {siteAssets.hero_background ? (
              <img src={siteAssets.hero_background} alt="United Hands Foundation field work" className="w-full h-full object-cover" style={{ minHeight: 280 }} loading="eager" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 280, background: 'linear-gradient(135deg, #0A3D22 0%, #11813F 100%)' }}>
                <AnimatedLogo size="xl" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* At a Glance — green stat band */}
      <section className="px-6 pb-14 reveal-section" data-testid="about-glance">
        <div
          className="max-w-6xl mx-auto rounded-[2rem] px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          style={{ background: 'linear-gradient(135deg, #0A3D22 0%, #10763E 100%)' }}
        >
          {[
            { label: 'Founded', value: '2020' },
            { label: 'Focus Areas', value: '4+' },
            { label: 'Locations', value: `${visibleLocations.length}` },
            { label: 'Approach', value: 'Community-led' }
          ].map(item => (
            <div key={item.label}>
              <p className="text-3xl sm:text-4xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>{item.value}</p>
              <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: '#F7C08A' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-mission">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="card-elevated p-8 md:p-10">
            <span className="inline-flex items-center justify-center rounded-full mb-6" style={{ width: 68, height: 68, background: '#3E9B4F' }}>
              <Target color="#FFFFFF" size={30} />
            </span>
            <h2 className="text-3xl mb-5" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-blue">Mission</span>
            </h2>
            <ul className="space-y-4">
              {missionPoints.map(point => (
                <li key={point} className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="mt-1 shrink-0" style={{ color: 'var(--accent-teal)' }} />
                  <span className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-8 md:p-10">
            <span className="inline-flex items-center justify-center rounded-full mb-6" style={{ width: 68, height: 68, background: '#F5822A' }}>
              <Award color="#FFFFFF" size={30} />
            </span>
            <h2 className="text-3xl mb-5" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Our <span className="text-gradient-orange">Vision</span>
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Build a compassionate, healthy, and self-reliant society where every individual —
              from children to the elderly — has access to dignity, care, opportunities, and hope.
            </p>
            <div className="border-l-4 pl-5 space-y-4" style={{ borderColor: 'var(--accent-gold)' }}>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-bold" style={{ color: 'var(--accent-teal)' }}>Care:</span> Human-first support that protects dignity.</p>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-bold" style={{ color: 'var(--accent-teal)' }}>Access:</span> Services delivered where people need them most.</p>
              <p style={{ color: 'var(--text-muted)' }}><span className="font-bold" style={{ color: 'var(--accent-teal)' }}>Impact:</span> Long-term change through local participation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Field Work Gallery from CMS */}
      {(siteAssets.hero_background || siteAssets.center_photo) && (
        <section className="py-16 px-6 reveal-section" data-testid="about-fieldwork">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl text-center mb-12" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              In the <span className="text-gradient-gold">Field</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {siteAssets.hero_background && (
                <div className="rounded-[1.5rem] overflow-hidden hover-lift card-elevated">
                  <img src={siteAssets.hero_background} alt="Field Work" className="w-full h-72 object-cover identity-lock" loading="lazy" />
                </div>
              )}
              {siteAssets.center_photo && (
                <div className="rounded-[1.5rem] overflow-hidden hover-lift card-elevated">
                  <img src={siteAssets.center_photo} alt="Community Service" className="w-full h-72 object-cover identity-lock" loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Where We Work — colorful circles */}
      <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-locations">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-12" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Where We <span className="text-gradient-blue">Work</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
            {visibleLocations.map((loc, idx) => (
              <div key={loc.id || loc.name} className="flex flex-col items-center text-center gap-3 group">
                <span
                  className="flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ width: 84, height: 84, background: locationColors[idx % locationColors.length], boxShadow: `0 0 0 4px #fff, 0 0 0 6px ${locationColors[idx % locationColors.length]}33` }}
                >
                  <MapPin color="#FFFFFF" size={34} strokeWidth={1.8} />
                </span>
                <h3 className="font-bold text-sm" style={{ color: 'var(--accent-teal)' }}>{loc.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{loc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal & Registration */}
      <section className="py-16 px-6" data-testid="about-legal">
        <div className="max-w-4xl mx-auto card-elevated p-10">
          <h2 className="text-3xl text-center mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
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
              <div key={item.label} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', borderLeft: '4px solid var(--accent-teal)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-gold)' }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 reveal-section" style={{ background: 'var(--bg-surface)' }} data-testid="about-cta">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedLogo size="lg" className="mx-auto mb-6" />
          <h2 className="text-4xl mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
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
