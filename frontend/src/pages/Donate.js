import { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
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
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentMode, setPaymentMode] = useState('manual_qr');

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  useEffect(() => {
    fetchProjects();
    fetchQrCode();
    fetchPaymentMode();
  }, []);

  const fetchQrCode = async () => {
    try {
      const response = await axios.get(`${API}/site-assets/qr_code`);
      setQrCodeUrl(response.data.asset_url);
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
    }
  };

  const fetchPaymentMode = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setPaymentMode(response.data.payment_mode || 'manual_qr');
    } catch (error) {
      console.error('Failed to fetch payment mode:', error);
    }
  };

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!formData.donor_name || !formData.donor_email || !formData.amount) {
      toast.error('Please fill name, email and amount');
      return;
    }
    setSubmitting(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        toast.error('Unable to load Razorpay checkout. Please try again in a moment.');
        return;
      }

      const response = await axios.post(`${API}/razorpay/create-order`, {
        amount: parseInt(formData.amount),
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        project_id: formData.project_id
      });

      const { order_id, key_id } = response.data;
      if (!order_id || !key_id) {
        toast.error('Razorpay is not configured correctly. Please contact support.');
        return;
      }

      const options = {
        key: key_id,
        amount: parseInt(formData.amount) * 100,
        currency: 'INR',
        name: 'United Hands Foundation',
        description: 'Donation',
        order_id: order_id,
        handler: async function (razorpayResponse) {
          try {
            await axios.post(`${API}/razorpay/verify`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              donor_name: formData.donor_name,
              donor_email: formData.donor_email,
              donor_phone: formData.donor_phone,
              donor_pan: formData.donor_pan,
              amount: parseInt(formData.amount),
              project_id: formData.project_id
            });
            setSubmitted(true);
            toast.success('Payment successful! 80G receipt will be sent to your email.');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.donor_name,
          email: formData.donor_email,
          contact: formData.donor_phone
        },
        theme: { color: '#1F6F6D' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Screenshot = reader.result;
        await axios.post(`${API}/donations`, {
          ...formData,
          amount: parseInt(formData.amount),
          screenshot_url: base64Screenshot
        });
        setSubmitted(true);
        toast.success('Donation submitted successfully! We will review and send your 80G receipt.');
        setTimeout(() => {
          setFormData({ donor_name: '', donor_email: '', donor_phone: '', donor_pan: '', amount: '', utr_number: '', project_id: preSelectedProjectId || '' });
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

  const inputStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h1
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              data-testid="donate-page-title"
            >
              Make a <span className="text-gradient-gold">Difference</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-base max-w-2xl mx-auto">
              Every contribution helps us provide healthcare, education, disaster relief, and elderly care across Maharashtra
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Payment Section */}
            <div className="card-elevated p-10 rounded-lg" data-testid="payment-section">
              {paymentMode === 'razorpay' ? (
                <>
                  <h2 className="text-3xl font-medium mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    Secure <span className="text-gradient-blue">Payment</span>
                  </h2>
                  <div className="p-8 rounded-lg mb-6 text-center" style={{ background: 'var(--bg-surface)' }}>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
                      <CheckCircle2 style={{ color: 'var(--accent-teal)' }} size={40} />
                    </div>
                    <h3 className="text-xl font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Razorpay Checkout</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                      Pay securely with UPI, Cards, Net Banking, or Wallets. Your 80G receipt will be emailed automatically.
                    </p>
                    <button
                      onClick={handleRazorpayCheckout}
                      disabled={submitting || !formData.amount || !formData.donor_name}
                      className="btn-gold w-full"
                      data-testid="razorpay-pay-btn"
                    >
                      {submitting ? 'Processing...' : `Pay ₹${formData.amount || '0'} Now`}
                    </button>
                  </div>
                  <div className="p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Indian Donors Only (INR) | 80G Tax Exemption | PAN Required for Tax Benefits
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-medium mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    Scan & Pay
                  </h2>
                  <div className="bg-white p-8 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-center">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="UPI QR Code" className="w-64 h-64 object-contain mx-auto mb-4" data-testid="qr-code-image" />
                      ) : (
                        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-4 rounded">
                          <span className="text-gray-400 text-sm">Loading QR Code...</span>
                        </div>
                      )}
                      <p className="text-gray-600 text-sm font-mono mb-4">UPI: unitedhands@upi</p>
                      {formData.amount && (
                        <a
                          href={generateUPIIntent()}
                          className="inline-block btn-gold text-sm"
                          style={{ padding: '10px 24px' }}
                          data-testid="upi-intent-btn"
                        >
                          Pay ₹{formData.amount} via UPI
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-6 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-warm)' }}>
                    <div className="flex items-start gap-3">
                      <AlertCircle style={{ color: 'var(--accent-gold)' }} className="flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Important Notes:</p>
                        <ul className="text-sm space-y-2 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
                          <li>Indian Donors Only (INR)</li>
                          <li>Save transaction screenshot</li>
                          <li>80G receipt sent after verification</li>
                          <li>PAN required for tax exemption</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Donation Form */}
            <div className="card-elevated p-10 rounded-lg" data-testid="donation-form">
              <h2 className="text-3xl font-medium mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                Donation Details
              </h2>

              {submitted ? (
                <div className="text-center py-12" data-testid="success-message">
                  <CheckCircle2 style={{ color: 'var(--accent-teal)' }} className="mx-auto mb-6" size={64} />
                  <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    Thank You!
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Your donation has been submitted. We'll send your 80G receipt after verification.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Select Cause *</label>
                    <select name="project_id" value={formData.project_id} onChange={handleInputChange} required className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="select-project">
                      <option value="">General Fund</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.title} ({project.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Full Name *</label>
                    <input type="text" name="donor_name" value={formData.donor_name} onChange={handleInputChange} required className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-name" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Email *</label>
                    <input type="email" name="donor_email" value={formData.donor_email} onChange={handleInputChange} required className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-email" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Phone Number *</label>
                    <input type="tel" name="donor_phone" value={formData.donor_phone} onChange={handleInputChange} required className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-phone" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>PAN Number *</label>
                    <input type="text" name="donor_pan" value={formData.donor_pan} onChange={handleInputChange} required pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" placeholder="ABCDE1234F" className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-pan" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Amount (INR) *</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required min="1" className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-amount" />
                  </div>

                  {paymentMode === 'manual_qr' && (
                    <>
                      <div>
                        <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>UTR / Transaction ID *</label>
                        <input type="text" name="utr_number" value={formData.utr_number} onChange={handleInputChange} required className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="input-utr" />
                      </div>
                      <div>
                        <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>Payment Screenshot *</label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--border-warm)' }}>
                          {screenshotPreview ? (
                            <div className="relative" data-testid="screenshot-preview">
                              <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto rounded" />
                              <button type="button" onClick={() => { setScreenshot(null); setScreenshotPreview(''); }} className="mt-4 text-sm hover:underline" style={{ color: 'var(--accent-teal)' }}>
                                Change Screenshot
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer" data-testid="upload-area">
                              <Upload style={{ color: 'var(--accent-gold)' }} className="mx-auto mb-4" size={48} />
                              <p className="mb-2" style={{ color: 'var(--text-primary)' }}>Click to upload</p>
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PNG, JPG up to 10MB</p>
                              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-3" data-testid="submit-donation-btn">
                    {submitting ? (<><Loader2 className="animate-spin" size={20} /> Submitting...</>) : 'Submit Donation'}
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
