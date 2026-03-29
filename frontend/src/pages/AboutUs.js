import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="about-title"
            >
              About <span className="text-[#D4AF37]">Our Foundation</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg max-w-4xl mx-auto leading-relaxed">
              Founded in 2020 by Dr. Rahul Sarwade and Dr. Jagruti Hankare, the United Hands Foundation was born from a single realization:<br/>
              <span className="text-[#F5F5F7] font-medium">Medicine can heal the body, but compassion heals the community.</span>
            </p>
          </div>

          {/* Mission Statement */}
          <div className="glass-morph p-12 rounded mb-20 text-center">
            <h2 
              className="text-3xl font-medium mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
            >
              Our <span className="text-[#D4AF37]">Mission</span>
            </h2>
            <p className="text-[#F5F5F7] text-lg leading-relaxed max-w-4xl mx-auto">
              From our roots in Latur to our camps in Panchgani, we serve as a safety net for the most vulnerable. 
              Whether it is dignity for the elderly through our 'Vayorang' program or immediate relief during rural crises, 
              we are <span className="text-[#D4AF37] font-semibold">hands-on, hearts-first</span>.
            </p>
          </div>

          {/* Founders Section - IDENTITY LOCK */}
          <div className="mb-20">
            <h2 
              className="text-4xl sm:text-5xl font-medium tracking-tight text-center mb-16"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
            >
              Meet Our <span className="text-[#D4AF37]">Founders</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Dr. Rahul Sarwade */}
              <div className="glass-morph p-8 rounded hover-lift" data-testid="founder-rahul">
                <div className="mb-6 overflow-hidden rounded">
                  <img 
                    src="https://images.unsplash.com/photo-1698465281093-9f09159733b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwwfHx8fDE3NzQ3NzkwNDN8MA&ixlib=rb-4.1.0&q=85"
                    alt="Dr. Rahul Sarwade"
                    className="w-full h-96 object-cover"
                    style={{filter: 'contrast(1.05) sepia(0.1) brightness(1.02)'}}
                  />
                </div>
                <h3 className="text-3xl font-medium mb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                  Dr. Rahul Sarwade
                </h3>
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-4">
                  Co-Founder & Director
                </p>
                <p className="text-[#A1A1AA] leading-relaxed mb-4">
                  Former Government of India medical officer bringing decades of healthcare expertise to elderly care. 
                  Dr. Sarwade's vision transformed from treating individual patients to healing entire communities.
                </p>
                <p className="text-[#F5F5F7] text-sm italic">
                  "Every elderly person deserves dignity in their final years. That's not medicine—that's humanity."
                </p>
              </div>

              {/* Dr. Jagruti Hankare */}
              <div className="glass-morph p-8 rounded hover-lift" data-testid="founder-jagruti">
                <div className="mb-6 overflow-hidden rounded">
                  <img 
                    src="https://images.pexels.com/photos/5738735/pexels-photo-5738735.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Dr. Jagruti Hankare"
                    className="w-full h-96 object-cover"
                    style={{filter: 'contrast(1.05) sepia(0.1) brightness(1.02)'}}
                  />
                </div>
                <h3 className="text-3xl font-medium mb-3" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                  Dr. Jagruti Hankare
                </h3>
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-4">
                  Co-Founder & Medical Director
                </p>
                <p className="text-[#A1A1AA] leading-relaxed mb-4">
                  Dedicated healthcare professional committed to improving quality of life for senior citizens. 
                  Dr. Hankare's compassionate approach has touched thousands of lives across Maharashtra.
                </p>
                <p className="text-[#F5F5F7] text-sm italic">
                  "Healthcare is a right, not a privilege. Our mission is to ensure no one is left behind."
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="mb-20">
            <div className="glass-morph rounded overflow-hidden">
              <div className="relative h-96">
                <img 
                  src="https://customer-assets.emergentagent.com/job_hands-omni-platform/artifacts/p87903ja_WhatsApp%20Image%202026-03-29%20at%2014.49.29.jpeg"
                  alt="UHF Geriatric Daycare Health Center"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-medium mb-2 text-[#F5F5F7]" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                    Our Registered Headquarters
                  </h3>
                  <p className="text-[#D4AF37] font-semibold">
                    UHF Geriatric Daycare Health Center - Latur, Maharashtra
                  </p>
                  <p className="text-[#F5F5F7] mt-2">
                    Our dedicated center of care, providing dignity and medical attention daily
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Identity */}
          <div className="glass-morph p-12 rounded">
            <h2 
              className="text-3xl font-medium mb-8 text-center"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
            >
              Legal <span className="text-[#D4AF37]">Identity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded">
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Registered Name</p>
                <p className="text-[#F5F5F7] text-lg font-semibold">United Hands Foundation TA JI LATUR</p>
              </div>

              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded">
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Registration Number</p>
                <p className="text-[#F5F5F7] text-lg font-semibold">Latur/0000171/2020</p>
              </div>

              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded">
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">PAN Number</p>
                <p className="text-[#F5F5F7] text-lg font-semibold">AABTU0797K</p>
              </div>

              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded">
                <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Established</p>
                <p className="text-[#F5F5F7] text-lg font-semibold">04 August 2020</p>
              </div>
            </div>

            <div className="mt-8 bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded text-center">
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">Registered Address</p>
              <p className="text-[#F5F5F7]">
                New Bhagya Nagar, Ring Road, Latur, Maharashtra - 413512
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
