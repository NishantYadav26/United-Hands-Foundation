import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Heart, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PillarsOfImpact from '@/components/PillarsOfImpact';
import axios from 'axios';

gsap.registerPlugin(ScrollTrigger);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [stats, setStats] = useState({
    patients_served: 0,
    districts_covered: 0,
    total_donations: 0,
    total_amount: 0
  });
  const [successStories, setSuccessStories] = useState([]);

  const statsRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    // Fetch success stories
    const fetchStories = async () => {
      try {
        const response = await axios.get(`${API}/success-stories?limit=3`);
        setSuccessStories(response.data);
      } catch (error) {
        console.error('Failed to fetch success stories:', error);
      }
    };

    fetchStats();
    fetchStories();
  }, []);

  useEffect(() => {
    // Hero animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );

    // Stats counter animation
    if (statsRef.current && stats.patients_served > 0) {
      const statElements = statsRef.current.querySelectorAll('.stat-number');
      
      statElements.forEach((element) => {
        const finalValue = parseInt(element.dataset.value);
        
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(element, {
              innerText: finalValue,
              duration: 2,
              snap: { innerText: 1 },
              ease: 'power2.out',
              onUpdate: function() {
                element.innerText = Math.ceil(this.targets()[0].innerText).toLocaleString();
              }
            });
          },
          once: true
        });
      });
    }

    // Section reveals
    gsap.utils.toArray('.reveal-section').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 px-6"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.7), rgba(26, 26, 26, 0.9)), url('https://static.prod-images.emergentagent.com/jobs/b524878d-50d7-4476-80ac-979da01feb2d/images/58284d2e183b0ebd5ac0387aac625a0bc4f964d8807c8d6c43c8df831f653478.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
        data-testid="hero-section"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-none mb-6 text-gradient-gold"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
            data-testid="hero-title"
          >
            Hands United,<br />Hearts Connected
          </h1>
          <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-3xl mx-auto mb-12 tracking-wide">
            Empowering elderly lives through our Vayorang care program across Maharashtra. 
            Every contribution creates dignity, comfort, and hope.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/donate" data-testid="hero-donate-btn">
              <button className="btn-gold">Support Our Cause</button>
            </Link>
            <a href="#impact" className="px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all text-sm font-semibold tracking-[0.1em] uppercase">
              See Our Impact
            </a>
          </div>

          {/* Indian Donors Only Disclaimer */}
          <div className="mt-12 inline-block glass-morph px-6 py-3 rounded">
            <p className="text-sm text-[#F5F5F7]">
              🇮🇳 Indian Donors Only (INR) | 80G Tax Exemption Available
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar - Districts */}
      <section className="py-12 bg-[#27272A] border-y border-[#D4AF37]/20" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-2">
              Serving Communities Across
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['Dharashiv', 'Solapur', 'Latur', 'Palghar', 'Panchgani'].map((district) => (
              <div key={district} className="text-center">
                <MapPin className="text-[#D4AF37] mx-auto mb-2" size={24} />
                <span className="text-[#F5F5F7] font-semibold">{district}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars of Impact */}
      <PillarsOfImpact />

      {/* Impact Stats */}
      <section ref={statsRef} id="impact" className="py-24 px-6 reveal-section" data-testid="impact-stats-section">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
          >
            Our <span className="text-[#D4AF37]">Impact</span>
          </h2>
          <p className="text-center text-[#A1A1AA] mb-16 text-lg">Transforming lives, one elderly individual at a time</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-morph p-12 rounded hover-lift text-center" data-testid="stat-patients">
              <Users className="text-[#D4AF37] mx-auto mb-6" size={48} />
              <div className="stat-number text-5xl font-medium mb-3 text-[#F5F5F7]" data-value={stats.patients_served} style={{fontFamily: 'Cormorant Garamond, serif'}}>
                0
              </div>
              <p className="text-xs text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Patients Served</p>
            </div>

            <div className="glass-morph p-12 rounded hover-lift text-center" data-testid="stat-districts">
              <MapPin className="text-[#D4AF37] mx-auto mb-6" size={48} />
              <div className="stat-number text-5xl font-medium mb-3 text-[#F5F5F7]" data-value={stats.districts_covered} style={{fontFamily: 'Cormorant Garamond, serif'}}>
                0
              </div>
              <p className="text-xs text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Districts Covered</p>
            </div>

            <div className="glass-morph p-12 rounded hover-lift text-center" data-testid="stat-donations">
              <Heart className="text-[#D4AF37] mx-auto mb-6" size={48} />
              <div className="stat-number text-5xl font-medium mb-3 text-[#F5F5F7]" data-value={stats.total_donations} style={{fontFamily: 'Cormorant Garamond, serif'}}>
                0
              </div>
              <p className="text-xs text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Donations Received</p>
            </div>

            <div className="glass-morph p-12 rounded hover-lift text-center" data-testid="stat-amount">
              <TrendingUp className="text-[#D4AF37] mx-auto mb-6" size={48} />
              <div className="stat-number text-5xl font-medium mb-3 text-[#F5F5F7]" data-value={stats.total_amount} style={{fontFamily: 'Cormorant Garamond, serif'}}>
                0
              </div>
              <p className="text-xs text-[#D4AF37] tracking-[0.2em] uppercase font-bold">Total Raised (₹)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      {successStories.length > 0 && (
        <section className="py-24 px-6 reveal-section" data-testid="success-stories-section">
          <div className="max-w-7xl mx-auto">
            <h2 
              className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-16"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
            >
              Stories of <span className="text-[#D4AF37]">Hope</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story) => (
                <div key={story.id} className="glass-morph p-8 rounded hover-lift" data-testid={`story-${story.id}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-[#D4AF37]" size={20} />
                    <span className="text-[#D4AF37] text-sm font-semibold">{story.location}</span>
                  </div>
                  <p className="text-[#F5F5F7] leading-relaxed mb-6">{story.story_text}</p>
                  <div className="flex justify-between items-center text-xs text-[#A1A1AA]">
                    <span>{story.patient_count} patients</span>
                    <span>{new Date(story.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Founders Section */}
      <section className="py-24 px-6 reveal-section" data-testid="founders-section">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-4"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
          >
            Meet Our <span className="text-[#D4AF37]">Founders</span>
          </h2>
          <p className="text-center text-[#A1A1AA] mb-16 text-lg">Ex-Government of India doctors dedicated to elderly care</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="text-center" data-testid="founder-rahul">
              <div className="mb-6 overflow-hidden rounded">
                <img 
                  src="https://images.unsplash.com/photo-1698465281093-9f09159733b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwwfHx8fDE3NzQ3NzkwNDN8MA&ixlib=rb-4.1.0&q=85"
                  alt="Dr. Rahul Sarwade"
                  className="w-full h-96 object-cover identity-lock"
                />
              </div>
              <h3 className="text-2xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>Dr. Rahul Sarwade</h3>
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Co-Founder</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">Former Government of India medical officer bringing decades of healthcare expertise to elderly care.</p>
            </div>

            <div className="text-center" data-testid="founder-jagruti">
              <div className="mb-6 overflow-hidden rounded">
                <img 
                  src="https://images.pexels.com/photos/5738735/pexels-photo-5738735.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Dr. Jagruti Hankare"
                  className="w-full h-96 object-cover identity-lock"
                />
              </div>
              <h3 className="text-2xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>Dr. Jagruti Hankare</h3>
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Co-Founder</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">Dedicated healthcare professional committed to improving quality of life for senior citizens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Authority Ticker */}
      <section className="py-12 bg-[#27272A] border-y border-[#D4AF37]/20 overflow-hidden" data-testid="authority-ticker">
        <div className="flex whitespace-nowrap">
          <div className="flex items-center gap-16 marquee">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-16">
                <span className="text-[#A1A1AA] text-sm tracking-[0.2em] uppercase">Featured In</span>
                <span className="text-[#F5F5F7] font-semibold text-lg">Sakal</span>
                <span className="text-[#F5F5F7] font-semibold text-lg">Lokmat</span>
                <span className="text-[#F5F5F7] font-semibold text-lg">Maharashtra Times</span>
                <span className="text-[#F5F5F7] font-semibold text-lg">The Hindu</span>
                <span className="text-[#F5F5F7] font-semibold text-lg">Indian Express</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 reveal-section" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center glass-morph p-16 rounded">
          <h2 
            className="text-4xl sm:text-5xl font-medium tracking-tight mb-6"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
          >
            Be the <span className="text-[#D4AF37]">Change</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg leading-relaxed mb-10">
            Your contribution provides dignity, medical care, and companionship to elderly individuals who need it most.
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
