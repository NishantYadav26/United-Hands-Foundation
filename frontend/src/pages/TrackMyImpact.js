import { useState } from 'react';
import { Search, Download, Loader2, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const TrackMyImpact = () => {
  const [formData, setFormData] = useState({ email: '', pan: '' });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  usePageRevealAnimation(`${donations.length}-${searched}`);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.post(`${API}/donor/track`, formData);
      setDonations(response.data.donations);
      if (response.data.donations.length === 0) {
        toast.info('No approved donations found for this Email + PAN combination');
      } else {
        toast.success(`Found ${response.data.donations.length} donation(s)`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search donations');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (donationId) => {
    try {
      const response = await axios.get(`${API}/donations/${donationId}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download receipt');
    }
  };

  const inputStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 reveal-section">
            <Heart className="mx-auto mb-6" size={56} style={{ color: 'var(--accent-gold)' }} />
            <h1
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}
              data-testid="track-title"
            >
              Track My <span className="text-gradient-orange">Impact</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-base max-w-2xl mx-auto">
              View your donation history and download 80G tax receipts. No password required.
            </p>
          </div>

          {/* Search Form */}
          <div className="card-elevated p-10 rounded-lg mb-12 reveal-section">
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="donor@example.com"
                  className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                  style={inputStyle}
                  data-testid="track-email-input"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-2" style={{ color: 'var(--accent-teal)' }}>
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  placeholder="ABCDE1234F"
                  className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                  style={inputStyle}
                  data-testid="track-pan-input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-3" data-testid="track-search-btn">
                {loading ? (<><Loader2 className="animate-spin" size={20} /> Searching...</>) : (<><Search size={20} /> Find My Donations</>)}
              </button>
            </form>

            <div className="mt-6 p-4 rounded" style={{ background: 'var(--bg-surface)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <strong>Privacy First:</strong> We only show donations that match BOTH your email AND PAN number. Your data is secure.
              </p>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div className="card-elevated p-8 rounded-lg reveal-section">
              <h2 className="text-3xl font-medium mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                Your Donation <span className="text-gradient-blue">History</span>
              </h2>

              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-muted)' }}>No approved donations found. If you recently donated, please wait for admin approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="p-6 rounded-lg hover-lift" style={{ background: 'var(--bg-surface)' }} data-testid={`donation-${donation.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold" style={{ color: 'var(--accent-gold)' }}>
                              {new Date(donation.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {donation.project_title && (
                              <span className="text-xs tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--accent-teal)' }}>
                                {donation.project_title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                              ₹{donation.amount.toLocaleString()}
                            </span>
                            {donation.receipt_number && (
                              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Receipt: {donation.receipt_number}</span>
                            )}
                          </div>
                        </div>
                        {donation.receipt_number && (
                          <button onClick={() => downloadReceipt(donation.id)} className="btn-primary flex items-center gap-2" data-testid={`download-${donation.id}`}>
                            <Download size={18} /> Download 80G PDF
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 p-6 rounded text-center" style={{ background: 'var(--bg-surface)' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Thank you for your {donations.length} donation{donations.length > 1 ? 's' : ''}!
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Total Impact: ₹{donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackMyImpact;
