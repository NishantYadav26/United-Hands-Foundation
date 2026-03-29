import { FileText, Shield, Award, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Transparency = () => {
  const documents = [
    {
      title: 'Society Registration',
      icon: FileText,
      description: 'Official registration certificate',
      link: '#'
    },
    {
      title: 'PAN Card',
      icon: Shield,
      description: 'Permanent Account Number',
      link: '#'
    },
    {
      title: '12A Certificate',
      icon: Award,
      description: 'Income Tax exemption certificate',
      link: '#'
    },
    {
      title: '80G Certificate',
      icon: Award,
      description: 'Tax deduction certificate for donors',
      link: '#'
    },
    {
      title: 'Board Resolution',
      icon: FileText,
      description: 'Organizational governance document',
      link: '#'
    },
    {
      title: 'Annual Report 2023-24',
      icon: FileText,
      description: 'Comprehensive annual report',
      link: '#'
    },
    {
      title: 'Audited Financials',
      icon: FileText,
      description: 'Certified financial statements',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="transparency-title"
            >
              Transparency & <span className="text-[#D4AF37]">Governance</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              We believe in complete transparency. Access all our legal and financial documents.
            </p>
          </div>

          {/* Legal Status Banner */}
          <div className="glass-morph p-8 rounded mb-12 text-center" data-testid="legal-status">
            <Shield className="text-[#D4AF37] mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-medium mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              Legally Registered NGO
            </h2>
            <p className="text-[#A1A1AA] max-w-3xl mx-auto">
              United Hands Foundation is registered under Section 12A and 80G of the Income Tax Act, 1961. 
              All donations are eligible for 50% tax deduction.
            </p>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <div 
                key={index}
                className="glass-morph p-8 rounded hover-lift"
                data-testid={`document-${index}`}
              >
                <doc.icon className="text-[#D4AF37] mb-6" size={40} />
                <h3 className="text-xl font-medium mb-3 text-[#F5F5F7]" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                  {doc.title}
                </h3>
                <p className="text-[#A1A1AA] text-sm mb-6">{doc.description}</p>
                <a
                  href={doc.link}
                  className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E5C047] transition-colors text-sm font-semibold"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            ))}
          </div>

          {/* FCRA Notice */}
          <div className="mt-16 bg-[#27272A] border border-[#D4AF37]/20 p-8 rounded" data-testid="fcra-notice">
            <h3 className="text-2xl font-medium mb-4 text-[#D4AF37]" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              FCRA Compliance Notice
            </h3>
            <p className="text-[#F5F5F7] leading-relaxed mb-4">
              United Hands Foundation currently accepts donations from Indian citizens only (INR transactions). 
              We are in the process of obtaining FCRA (Foreign Contribution Regulation Act) registration to accept international donations.
            </p>
            <p className="text-[#A1A1AA] text-sm">
              All non-INR transactions are automatically blocked to ensure full regulatory compliance.
            </p>
          </div>

          {/* Contact for Queries */}
          <div className="mt-12 text-center glass-morph p-8 rounded">
            <h3 className="text-2xl font-medium mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
              Questions or Queries?
            </h3>
            <p className="text-[#A1A1AA] mb-6">
              For any questions about our governance, finances, or operations, please contact us.
            </p>
            <a
              href="mailto:transparency@unitedhands.org"
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