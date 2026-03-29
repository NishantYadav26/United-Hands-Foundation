import { useState } from 'react';
import { Search, Download, Loader2, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TrackMyImpact = () => {
  const [formData, setFormData] = useState({
    email: '',
    pan: ''
  });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
      const response = await axios.get(`${API}/donations/${donationId}/receipt`, {
        responseType: 'blob'
      });
      
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

  return (
    <div className="min-h-screen" style={{background: '#0A1128'}}>
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Heart className="mx-auto mb-6" size={64} style={{color: '#E67E22'}} />
            <h1 
              className="text-5xl sm:text-6xl font-medium tracking-tight mb-6"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="track-title"
            >
              Track My <span className="text-gradient-orange">Impact</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
              View your donation history and download 80G tax receipts. No password required.
            </p>
          </div>

          {/* Search Form */}
          <div className="glass-morph p-12 rounded mb-12">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-[#3498DB] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="donor@example.com"
                  className="w-full bg-[#1C2951] border blue-border rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#3498DB]"
                  data-testid="track-email-input"
                />
              </div>

              <div>
                <label className="block text-[#3498DB] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})}
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  placeholder="ABCDE1234F"
                  className="w-full bg-[#1C2951] border blue-border rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#3498DB]"
                  data-testid="track-pan-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-orange w-full flex items-center justify-center gap-3"
                data-testid="track-search-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Find My Donations
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#1C2951]/50 border blue-border rounded">
              <p className="text-[#A1A1AA] text-sm">
                🔒 <strong>Privacy First:</strong> We only show donations that match BOTH your email AND PAN number. Your data is secure.
              </p>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div className="glass-morph p-8 rounded">
              <h2 
                className="text-3xl font-medium mb-8"
                style={{fontFamily: 'Cormorant Garamond, serif'}}
              >
                Your Donation <span className="text-gradient-blue">History</span>
              </h2>

              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#A1A1AA]">
                    No approved donations found. If you recently donated, please wait for admin approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div 
                      key={donation.id}
                      className="bg-[#1C2951] border blue-border p-6 rounded hover-lift"
                      data-testid={`donation-${donation.id}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[#E67E22] text-sm font-semibold">
                              {new Date(donation.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            {donation.project_title && (
                              <span className="text-[#3498DB] text-xs tracking-[0.2em] uppercase font-bold">
                                {donation.project_title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-medium text-[#F5F5F7]" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                              ₹{donation.amount.toLocaleString()}
                            </span>
                            {donation.receipt_number && (
                              <span className="text-[#A1A1AA] text-sm">
                                Receipt: {donation.receipt_number}
                              </span>
                            )}
                          </div>
                        </div>

                        {donation.receipt_number && (
                          <button
                            onClick={() => downloadReceipt(donation.id)}
                            className="btn-primary flex items-center gap-2"
                            data-testid={`download-${donation.id}`}
                          >
                            <Download size={18} />
                            Download 80G PDF
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 p-6 bg-[#1C2951]/50 border blue-border rounded text-center">
                    <p className="text-[#F5F5F7] font-semibold mb-2">
                      Thank you for your {donations.length} donation{donations.length > 1 ? 's' : ''}!
                    </p>
                    <p className="text-[#A1A1AA] text-sm">
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