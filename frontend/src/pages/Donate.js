import { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Donate = () => {
  const [searchParams] = useSearchParams();
  const preSelectedProjectId = searchParams.get('project');
  
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    donor_pan: '',
    amount: '',
    utr_number: '',
    project_id: preSelectedProjectId || ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects?active_only=true`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const generateUPIIntent = () => {
    const upiId = 'unitedhands@upi';
    const name = 'United Hands Foundation';
    const amount = formData.amount || '500';
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      // Create local preview without Cloudinary
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setSubmitting(true);

    try {
      // MOCK: Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Screenshot = reader.result;
        
        // Submit donation with base64 screenshot (MOCK)
        await axios.post(`${API}/donations`, {
          ...formData,
          amount: parseInt(formData.amount),
          screenshot_url: base64Screenshot // In production, this would be Cloudinary URL
        });

        setSubmitted(true);
        toast.success('Donation submitted successfully! We will review and send your 80G receipt.');
        
        // Reset form
        setTimeout(() => {
          setFormData({
            donor_name: '',
            donor_email: '',
            donor_phone: '',
            donor_pan: '',
            amount: '',
            utr_number: '',
            project_id: preSelectedProjectId || ''
          });
          setScreenshot(null);
          setScreenshotPreview('');
          setSubmitted(false);
        }, 3000);
      };
      
      reader.readAsDataURL(screenshot);
    } catch (error) {
      console.error('Donation submission failed:', error);
      toast.error('Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="donate-page-title"
            >
              Make a <span className="text-[#D4AF37]">Difference</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              Every contribution helps us provide dignity and care to elderly individuals across Maharashtra
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* QR Code Section */}
            <div className="glass-morph p-12 rounded" data-testid="qr-section">
              <h2 
                className="text-3xl font-medium mb-6"
                style={{fontFamily: 'Cormorant Garamond, serif'}}
              >
                Scan & Pay
              </h2>
              
              <div className="bg-white p-8 rounded mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-64 h-64 bg-gray-200 flex items-center justify-center mb-4">
                    {/* Placeholder QR Code */}
                    <span className="text-gray-400 text-sm">UPI QR Code</span>
                  </div>
                  <p className="text-gray-600 text-sm font-mono mb-4">UPI: unitedhands@upi</p>
                  
                  {/* UPI Intent Button */}
                  {formData.amount && (
                    <a
                      href={generateUPIIntent()}
                      className="inline-block bg-[#D4AF37] hover:bg-[#E5C047] text-[#1A1A1A] px-6 py-3 rounded font-semibold text-sm transition-colors"
                      data-testid="upi-intent-btn"
                    >
                      Pay ₹{formData.amount} via UPI
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-[#D4AF37] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-[#F5F5F7] font-semibold mb-2">Important Notes:</p>
                    <ul className="text-[#A1A1AA] text-sm space-y-2 list-disc list-inside">
                      <li>🇮🇳 Indian Donors Only (INR)</li>
                      <li>Save transaction screenshot</li>
                      <li>80G receipt sent after verification</li>
                      <li>PAN required for tax exemption</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Form */}
            <div className="glass-morph p-12 rounded" data-testid="donation-form">
              <h2 
                className="text-3xl font-medium mb-6"
                style={{fontFamily: 'Cormorant Garamond, serif'}}
              >
                Donation Details
              </h2>

              {submitted ? (
                <div className="text-center py-12" data-testid="success-message">
                  <CheckCircle2 className="text-[#D4AF37] mx-auto mb-6" size={64} />
                  <h3 className="text-2xl font-medium mb-4" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                    Thank You!
                  </h3>
                  <p className="text-[#A1A1AA]">
                    Your donation has been submitted. We'll send your 80G receipt after verification.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Select Cause *
                    </label>
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="select-project"
                    >
                      <option value="">General Fund</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} ({project.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="donor_name"
                      value={formData.donor_name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="donor_email"
                      value={formData.donor_email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="donor_phone"
                      value={formData.donor_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      name="donor_pan"
                      value={formData.donor_pan}
                      onChange={handleInputChange}
                      required
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      placeholder="ABCDE1234F"
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-pan"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-amount"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      UTR / Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="utr_number"
                      value={formData.utr_number}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#27272A] border border-[#D4AF37]/20 rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#D4AF37]"
                      data-testid="input-utr"
                    />
                  </div>

                  <div>
                    <label className="block text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                      Payment Screenshot *
                    </label>
                    <div className="border-2 border-dashed border-[#D4AF37]/20 rounded p-8 text-center">
                      {screenshotPreview ? (
                        <div className="relative" data-testid="screenshot-preview">
                          <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto rounded" />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshot(null);
                              setScreenshotPreview('');
                            }}
                            className="mt-4 text-[#D4AF37] text-sm hover:underline"
                          >
                            Change Screenshot
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer" data-testid="upload-area">
                          <Upload className="text-[#D4AF37] mx-auto mb-4" size={48} />
                          <p className="text-[#F5F5F7] mb-2">Click to upload</p>
                          <p className="text-[#A1A1AA] text-sm">PNG, JPG up to 10MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full flex items-center justify-center gap-3"
                    data-testid="submit-donation-btn"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Donation'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donate;
