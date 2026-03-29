import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Donate = () => {
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    donor_pan: '',
    amount: '',
    utr_number: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      // Get signature from backend
      const sigResponse = await axios.get(`${API}/cloudinary/signature?resource_type=image&folder=donations`);
      const { signature, timestamp, cloud_name, api_key, folder } = sigResponse.data;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );

      return uploadResponse.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
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
      // Upload screenshot
      setUploading(true);
      const screenshotUrl = await uploadToCloudinary(screenshot);
      setUploading(false);

      // Submit donation
      await axios.post(`${API}/donations`, {
        ...formData,
        amount: parseInt(formData.amount),
        screenshot_url: screenshotUrl
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
          utr_number: ''
        });
        setScreenshot(null);
        setScreenshotPreview('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Donation submission failed:', error);
      toast.error('Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
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
                  <p className="text-gray-600 text-sm font-mono">UPI: unitedhands@upi</p>
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
                    disabled={submitting || uploading}
                    className="btn-gold w-full flex items-center justify-center gap-3"
                    data-testid="submit-donation-btn"
                  >
                    {(submitting || uploading) ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {uploading ? 'Uploading...' : 'Submitting...'}
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
