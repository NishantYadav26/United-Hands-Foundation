import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  DollarSign,
  FolderKanban,
  Heart,
  Image,
  Loader2,
  LogOut,
  MapPin,
  Newspaper,
  Users,
  UsersRound,
  Video,
  XCircle
} from 'lucide-react';
import Footer from '@/components/Footer';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';
import Navbar from '@/components/Navbar';
import MediaLibrary from '@/components/MediaLibrary';
import TeamPillars from '@/components/TeamPillars';
import ProjectsManagement from '@/components/ProjectsManagement';
import GalleryManagement from '@/components/GalleryManagement';
import PressManagement from '@/components/PressManagement';
import VideosManagement from '@/components/VideosManagement';
import SuccessStoriesManagement from '@/components/SuccessStoriesManagement';
import LocationsManagement from '@/components/LocationsManagement';
import axios from 'axios';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');

  usePageRevealAnimation(`${activeTab}-${donations.length}-${loading}`);

  useEffect(() => {
    fetchDonations();
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('uhf_admin_token');
    localStorage.removeItem('uhf_user_token');
    localStorage.removeItem('uhf_user_data');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API}/donations`);
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleStatusChange = async (donation, status) => {
    const actionLabel = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'move back to pending';
    const shouldProceed = window.confirm(`Are you sure you want to ${actionLabel} this donation?`);
    if (!shouldProceed) return;

    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.post(`${API}/donations/approve`, {
        donation_id: donation.id,
        status
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (status === 'approved') {
        toast.success(donation.status === 'approved' ? 'Donation already approved' : 'Donation approved and receipt sent!');
      } else if (status === 'rejected') {
        toast.success('Donation marked as rejected');
      } else {
        toast.success('Donation moved back to pending');
      }

      fetchDonations();
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error('Failed to update donation status');
    }
  };

  const handleTogglePaymentMode = async () => {
    const newMode = settings.payment_mode === 'manual_qr' ? 'razorpay' : 'manual_qr';
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.put(`${API}/admin/settings`, {
        ...settings,
        payment_mode: newMode
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSettings({ ...settings, payment_mode: newMode });
      toast.success(`Payment mode switched to ${newMode === 'manual_qr' ? 'Manual QR' : 'Razorpay'}`);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update payment mode');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('uhf_admin_token');
      await axios.put(`${API}/admin/settings`, settings, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const approvedDonations = donations.filter(d => d.status === 'approved');

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-deep)'}}>
      <Navbar />

      <div className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4 reveal-section">
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight"
              style={{fontFamily: 'Cormorant Garamond, serif'}}
              data-testid="admin-title"
            >
              Admin <span className="text-gradient-blue">Dashboard</span>
            </h1>
            <button 
              onClick={handleLogout}
              className="btn-orange flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3"
              data-testid="logout-btn"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 reveal-section">
            <div className="glass-morph p-8 rounded reveal-section" data-testid="stat-card-pending">
              <Users className="mb-4" style={{color: 'var(--accent-warm)'}} size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                {pendingDonations.length}
              </div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Pending Approvals</p>
            </div>

            <div className="glass-morph p-8 rounded reveal-section" data-testid="stat-card-approved">
              <CheckCircle className="mb-4" style={{color: 'var(--accent-teal)'}} size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                {approvedDonations.length}
              </div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Approved Donations</p>
            </div>

            <div className="glass-morph p-8 rounded reveal-section" data-testid="stat-card-total">
              <DollarSign className="mb-4" style={{color: 'var(--accent-gold)'}} size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                ₹{approvedDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Total Raised</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-8 border-b blue-border overflow-x-auto pb-0 reveal-section">
            <button
              onClick={() => setActiveTab('donations')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap ${
                activeTab === 'donations' ? 'text-[var(--accent-teal)] border-b-2 border-[var(--accent-teal)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-donations"
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'projects' ? 'text-[var(--accent-teal)] border-b-2 border-[var(--accent-teal)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-projects"
            >
              <FolderKanban size={16} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'gallery' ? 'text-[var(--accent-warm)] border-b-2 border-[var(--accent-warm)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-gallery"
            >
              <Heart size={16} />
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'media' ? 'text-[var(--accent-teal)] border-b-2 border-[var(--accent-teal)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-media"
            >
              <Image size={16} />
              Media Library
            </button>
            <button
              onClick={() => setActiveTab('pillars')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'pillars' ? 'text-[var(--accent-warm)] border-b-2 border-[var(--accent-warm)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-pillars"
            >
              <UsersRound size={16} />
              Team & Partners
            </button>
            <button
              onClick={() => setActiveTab('press')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'press' ? 'text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-press"
            >
              <Newspaper size={16} />
              Press
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'videos' ? 'text-[var(--accent-warm)] border-b-2 border-[var(--accent-warm)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-videos"
            >
              <Video size={16} />
              Videos
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'stories' ? 'text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-stories"
            >
              <BookOpen size={16} />
              Stories
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'locations' ? 'text-[var(--accent-teal)] border-b-2 border-[var(--accent-teal)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-locations"
            >
              <MapPin size={16} />
              Locations
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase transition-colors whitespace-nowrap ${
                activeTab === 'settings' ? 'text-[var(--accent-teal)] border-b-2 border-[var(--accent-teal)]' : 'text-[var(--text-muted)]'
              }`}
              data-testid="tab-settings"
            >
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === 'donations' && (
            <div className="glass-morph p-8 rounded reveal-section" data-testid="donations-list">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto mb-4" style={{color: 'var(--accent-warm)'}} size={48} />
                  <p style={{color: 'var(--text-muted)'}}>Loading donations...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{color: 'var(--text-muted)'}}>No donations yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{borderColor: 'var(--border-warm)'}}>
                        <th className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold" style={{color: 'var(--accent-warm)'}}>Donor</th>
                        <th className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold" style={{color: 'var(--accent-warm)'}}>Amount</th>
                        <th className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold" style={{color: 'var(--accent-warm)'}}>UTR</th>
                        <th className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold" style={{color: 'var(--accent-warm)'}}>Status</th>
                        <th className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold" style={{color: 'var(--accent-warm)'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id} className="border-b" style={{borderColor: 'var(--border-subtle)'}} data-testid={`donation-${donation.id}`}>
                          <td className="py-4 px-4">
                            <div className="font-medium" style={{color: 'var(--text-primary)'}}>{donation.donor_name}</div>
                            <div className="text-sm" style={{color: 'var(--text-muted)'}}>{donation.donor_email}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold" style={{color: 'var(--text-primary)'}}>₹{donation.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-sm" style={{color: 'var(--text-muted)'}}>{donation.utr_number}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                              donation.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              donation.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {donation.status !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(donation, 'approved')}
                                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors"
                                  data-testid={`approve-${donation.id}`}
                                  title="Mark as approved"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {donation.status !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(donation, 'rejected')}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                                  data-testid={`reject-${donation.id}`}
                                  title="Mark as rejected"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              {donation.status !== 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(donation, 'pending')}
                                  className="px-3 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                                  data-testid={`pending-${donation.id}`}
                                  title="Move back to pending"
                                >
                                  Pending
                                </button>
                              )}
                            </div>
                            {donation.status === 'approved' && donation.receipt_number && (
                              <span className="block mt-2 text-xs" style={{color: 'var(--text-muted)'}}>{donation.receipt_number}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && <ProjectsManagement />}

          {activeTab === 'gallery' && <GalleryManagement />}

          {activeTab === 'settings' && settings && (
            <div className="glass-morph p-8 rounded reveal-section" data-testid="settings-panel">
              <h2 
                className="text-3xl font-medium mb-8"
                style={{fontFamily: 'Cormorant Garamond, serif'}}
              >
                Payment Settings
              </h2>

              {/* Payment Mode Toggle */}
              <div className="p-8 rounded mb-6" style={{background: 'var(--bg-card)', border: '1px solid var(--border-warm)'}}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-primary)'}}>Global Payment Mode Toggle</h3>
                    <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                      Current Mode: <span className="font-semibold" style={{color: 'var(--accent-warm)'}}>
                        {settings.payment_mode === 'manual_qr' ? 'Manual QR' : 'Razorpay'}
                      </span>
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment_mode === 'razorpay'}
                    onCheckedChange={handleTogglePaymentMode}
                    disabled={settings.payment_mode !== 'razorpay' && !settings.razorpay_key_id}
                    data-testid="payment-mode-toggle"
                  />
                </div>

                {!settings.razorpay_key_id && settings.payment_mode !== 'razorpay' && (
                  <p className="text-xs mb-4" style={{color: 'var(--accent-warm)'}}>
                    Add Razorpay credentials below to enable the toggle
                  </p>
                )}

                <div className="p-6 rounded" style={{background: 'var(--bg-deep)'}}>
                  {settings.payment_mode === 'manual_qr' ? (
                    <div>
                      <p className="text-sm font-semibold mb-3" style={{color: 'var(--accent-warm)'}}>MODE A: Manual QR (Active)</p>
                      <ul className="text-sm space-y-2" style={{color: 'var(--text-muted)'}}>
                        <li>Display UPI QR Code</li>
                        <li>Donors fill form with UTR & screenshot</li>
                        <li>Manual approval required</li>
                        <li>80G receipt sent after approval</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold mb-3" style={{color: 'var(--accent-teal)'}}>MODE B: Razorpay (Active)</p>
                      <ul className="text-sm space-y-2" style={{color: 'var(--text-muted)'}}>
                        <li>Razorpay Standard Checkout</li>
                        <li>Automated payment processing</li>
                        <li>Instant payment confirmation</li>
                        <li>Auto-generated 80G receipt</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Razorpay Configuration */}
              <div className="p-8 rounded mb-6" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
                <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-primary)'}}>Razorpay Configuration</h3>
                <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>
                  Enter your Razorpay API credentials. Once saved, you can toggle to Razorpay payment mode above.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{color: 'var(--accent-teal)'}}>
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_live_xxxxxxxxxx"
                      value={settings.razorpay_key_id || ''}
                      onChange={e => setSettings({...settings, razorpay_key_id: e.target.value})}
                      className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                      style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                      data-testid="razorpay-key-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{color: 'var(--accent-teal)'}}>
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your Razorpay secret"
                      value={settings.razorpay_key_secret || ''}
                      onChange={e => setSettings({...settings, razorpay_key_secret: e.target.value})}
                      className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                      style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                      data-testid="razorpay-secret-input"
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="btn-primary"
                    data-testid="save-razorpay-btn"
                  >
                    Save Razorpay Settings
                  </button>
                  {settings.razorpay_key_id && (
                    <p className="text-xs mt-2" style={{color: 'var(--accent-teal)'}}>
                      Razorpay credentials saved. You can now toggle to Razorpay mode above.
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media Links */}
              <div className="p-8 rounded mb-6" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'}}>
                <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-primary)'}}>Social Media Links</h3>
                <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>
                  Add your social media profile URLs. These will appear in the website footer.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{color: 'var(--accent-teal)'}}>
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={settings.facebook_url || ''}
                      onChange={e => setSettings({...settings, facebook_url: e.target.value})}
                      className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                      style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                      data-testid="facebook-url-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{color: 'var(--accent-teal)'}}>
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={settings.instagram_url || ''}
                      onChange={e => setSettings({...settings, instagram_url: e.target.value})}
                      className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                      style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                      data-testid="instagram-url-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-bold mb-2" style={{color: 'var(--accent-teal)'}}>
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={settings.youtube_url || ''}
                      onChange={e => setSettings({...settings, youtube_url: e.target.value})}
                      className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                      style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                      data-testid="youtube-url-input"
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="btn-primary"
                    data-testid="save-social-btn"
                  >
                    Save Social Links
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Library Tab */}
          {activeTab === 'media' && <MediaLibrary />}

          {/* Team Pillars Tab */}
          {activeTab === 'pillars' && <TeamPillars />}

          {/* Videos Tab */}
          {activeTab === 'press' && <PressManagement />}

          {/* Videos Tab */}
          {activeTab === 'videos' && <VideosManagement />}


          {/* Success Stories Tab */}
          {activeTab === 'stories' && <SuccessStoriesManagement />}

          {/* Locations Tab */}
          {activeTab === 'locations' && <LocationsManagement />}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
