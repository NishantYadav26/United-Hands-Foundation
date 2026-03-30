import { Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Transparency = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              data-testid="transparency-title"
            >
              Transparency & <span className="text-gradient-gold">Governance</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-base max-w-2xl mx-auto">
              We believe in complete transparency and regulatory compliance.
            </p>
          </div>

          {/* Legal Status Banner */}
          <div className="card-elevated p-8 rounded-lg mb-12 text-center" data-testid="legal-status">
            <Shield style={{ color: 'var(--accent-teal)' }} className="mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Legally Registered NGO
            </h2>
            <p style={{ color: 'var(--text-muted)' }} className="max-w-3xl mx-auto mb-6">
              United Hands Foundation is registered under Section 12A and 80G of the Income Tax Act, 1961.
              All donations are eligible for 50% tax deduction.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-teal)' }}>PAN</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>AABTU0797K</span>
              </div>
              <div className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-teal)' }}>80G</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>AABTU0797KF20231</span>
              </div>
              <div className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-teal)' }}>12A</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>AABTU0797KE20231</span>
              </div>
              <div className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                <span className="text-xs tracking-[0.15em] uppercase font-bold block mb-1" style={{ color: 'var(--accent-teal)' }}>Society Reg</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Latur/0000171/2020</span>
              </div>
            </div>
          </div>

          {/* FCRA Notice */}
          <div className="card-elevated p-8 rounded-lg mb-12" style={{ borderLeft: '4px solid var(--accent-gold)' }} data-testid="fcra-notice">
            <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--accent-teal)' }}>
              FCRA Compliance Notice
            </h3>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
              United Hands Foundation currently accepts donations from Indian citizens only (INR transactions).
              We are in the process of obtaining FCRA (Foreign Contribution Regulation Act) registration to accept international donations.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              All non-INR transactions are automatically blocked to ensure full regulatory compliance.
            </p>
          </div>

          {/* Contact for Queries */}
          <div className="text-center card-elevated p-8 rounded-lg">
            <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Questions or Queries?
            </h3>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6">
              For any questions about our governance, finances, or operations, please contact us.
            </p>
            <a
              href="mailto:Uniteduhf@gmail.com"
              className="inline-block btn-gold"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Transparency;
