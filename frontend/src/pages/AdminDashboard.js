import { useState, useEffect } from 'react';
import { Users, DollarSign, CheckCircle, XCircle, Settings, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');

  useEffect(() => {
    fetchDonations();
    fetchSettings();
    fetchProjects();
  }, []);

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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
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

  const handleSeedProjects = async () => {
    try {
      await axios.post(`${API}/seed/projects`);
      toast.success('Default projects created successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Failed to seed projects:', error);
      toast.error('Failed to create projects');
    }
  };

  const handleApprove = async (donationId) => {
    try {
      await axios.post(`${API}/donations/approve`, {
        donation_id: donationId,
        status: 'approved'
      });
      toast.success('Donation approved and receipt sent!');
      fetchDonations();
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve donation');
    }
  };

  const handleReject = async (donationId) => {
    try {
      await axios.post(`${API}/donations/approve`, {
        donation_id: donationId,
        status: 'rejected'
      });
      toast.success('Donation rejected');
      fetchDonations();
    } catch (error) {
      console.error('Rejection failed:', error);
      toast.error('Failed to reject donation');
    }
  };

  const handleTogglePaymentMode = async () => {
    const newMode = settings.payment_mode === 'manual_qr' ? 'razorpay' : 'manual_qr';
    try {
      await axios.put(`${API}/admin/settings`, {
        ...settings,
        payment_mode: newMode
      });
      setSettings({ ...settings, payment_mode: newMode });
      toast.success(`Payment mode switched to ${newMode === 'manual_qr' ? 'Manual QR' : 'Razorpay'}`);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update payment mode');
    }
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const approvedDonations = donations.filter(d => d.status === 'approved');

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-5xl sm:text-6xl font-medium tracking-tight mb-12"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
            data-testid="admin-title"
          >
            Admin <span className="text-[#D4AF37]">Dashboard</span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-morph p-8 rounded" data-testid="stat-card-pending">
              <Users className="text-[#D4AF37] mb-4" size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                {pendingDonations.length}
              </div>
              <p className="text-[#A1A1AA] text-sm">Pending Approvals</p>
            </div>

            <div className="glass-morph p-8 rounded" data-testid="stat-card-approved">
              <CheckCircle className="text-[#D4AF37] mb-4" size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                {approvedDonations.length}
              </div>
              <p className="text-[#A1A1AA] text-sm">Approved Donations</p>
            </div>

            <div className="glass-morph p-8 rounded" data-testid="stat-card-total">
              <DollarSign className="text-[#D4AF37] mb-4" size={32} />
              <div className="text-4xl font-medium mb-2" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                ₹{approvedDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </div>
              <p className="text-[#A1A1AA] text-sm">Total Raised</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-[#D4AF37]/20">
            <button
              onClick={() => setActiveTab('donations')}
              className={`pb-4 px-6 text-sm font-semibold tracking-[0.1em] uppercase transition-colors ${
                activeTab === 'donations' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#A1A1AA]'
              }`}
              data-testid="tab-donations"
            >
              Donations
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-4 px-6 text-sm font-semibold tracking-[0.1em] uppercase transition-colors ${
                activeTab === 'projects' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#A1A1AA]'
              }`}
              data-testid="tab-projects"
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-6 text-sm font-semibold tracking-[0.1em] uppercase transition-colors ${
                activeTab === 'settings' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#A1A1AA]'
              }`}
              data-testid="tab-settings"
            >
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === 'donations' && (
            <div className="glass-morph p-8 rounded" data-testid="donations-list">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={48} />
                  <p className="text-[#A1A1AA]">Loading donations...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#A1A1AA]">No donations yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="text-left py-4 px-4 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">Donor</th>
                        <th className="text-left py-4 px-4 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">Amount</th>
                        <th className="text-left py-4 px-4 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">UTR</th>
                        <th className="text-left py-4 px-4 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">Status</th>
                        <th className="text-left py-4 px-4 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id} className="border-b border-[#D4AF37]/10" data-testid={`donation-${donation.id}`}>
                          <td className="py-4 px-4">
                            <div className="text-[#F5F5F7] font-medium">{donation.donor_name}</div>
                            <div className="text-[#A1A1AA] text-sm">{donation.donor_email}</div>
                          </td>
                          <td className="py-4 px-4 text-[#F5F5F7] font-semibold">₹{donation.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-[#A1A1AA] text-sm">{donation.utr_number}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                              donation.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                              donation.status === 'approved' ? 'bg-green-900/20 text-green-400' :
                              'bg-red-900/20 text-red-400'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {donation.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(donation.id)}
                                  className="p-2 bg-green-900/20 hover:bg-green-900/40 text-green-400 rounded transition-colors"
                                  data-testid={`approve-${donation.id}`}
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleReject(donation.id)}
                                  className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                  data-testid={`reject-${donation.id}`}
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                            {donation.status === 'approved' && donation.receipt_number && (
                              <span className="text-[#A1A1AA] text-xs">{donation.receipt_number}</span>
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

          {activeTab === 'projects' && (
            <div className="glass-morph p-8 rounded" data-testid="projects-panel">
              <div className="flex justify-between items-center mb-8">
                <h2 
                  className="text-3xl font-medium"
                  style={{fontFamily: 'Cormorant Garamond, serif'}}
                >
                  Projects Management
                </h2>
                <button
                  onClick={handleSeedProjects}
                  className="btn-gold"
                  data-testid="seed-projects-btn"
                >
                  Seed Default Projects
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#A1A1AA] mb-4">No projects yet</p>
                  <button onClick={handleSeedProjects} className="btn-gold">
                    Create Default Projects
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => {
                    const progress = Math.min((project.raised_amount / project.target_amount) * 100, 100);
                    
                    return (
                      <div 
                        key={project.id}
                        className="bg-[#27272A] border border-[#D4AF37]/20 p-6 rounded"
                        data-testid={`project-card-${project.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-medium text-[#F5F5F7] mb-1" style={{fontFamily: 'Cormorant Garamond, serif'}}>
                              {project.title}
                            </h3>
                            <span className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold">
                              {project.category}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            project.is_active ? 'bg-green-900/20 text-green-400' : 'bg-gray-900/20 text-gray-400'
                          }`}>
                            {project.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#A1A1AA]">
                              ₹{project.raised_amount.toLocaleString()} / ₹{project.target_amount.toLocaleString()}
                            </span>
                            <span className="text-[#D4AF37] font-semibold">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#D4AF37] to-[#E5C047] h-full"
                              style={{width: `${progress}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className="glass-morph p-8 rounded" data-testid="settings-panel">
              <h2 
                className="text-3xl font-medium mb-8"
                style={{fontFamily: 'Cormorant Garamond, serif'}}
              >
                Payment Settings
              </h2>

              <div className="bg-[#27272A] border border-[#D4AF37]/20 p-8 rounded mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[#F5F5F7] font-semibold text-lg mb-2">Global Payment Mode Toggle</h3>
                    <p className="text-[#A1A1AA] text-sm">
                      Current Mode: <span className="text-[#D4AF37] font-semibold">{settings.payment_mode === 'manual_qr' ? 'Manual QR' : 'Razorpay'}</span>
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment_mode === 'razorpay'}
                    onCheckedChange={handleTogglePaymentMode}
                    data-testid="payment-mode-toggle"
                  />
                </div>

                <div className="bg-[#1A1A1A] p-6 rounded">
                  {settings.payment_mode === 'manual_qr' ? (
                    <div>
                      <p className="text-[#D4AF37] text-sm font-semibold mb-3">MODE A: Manual QR (Active)</p>
                      <ul className="text-[#A1A1AA] text-sm space-y-2">
                        <li>✓ Display UPI QR Code</li>
                        <li>✓ Donors fill form with UTR & screenshot</li>
                        <li>✓ Manual approval required</li>
                        <li>✓ 80G receipt sent after approval</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#D4AF37] text-sm font-semibold mb-3">MODE B: Razorpay (Active)</p>
                      <ul className="text-[#A1A1AA] text-sm space-y-2">
                        <li>✓ Razorpay Standard Checkout</li>
                        <li>✓ Automated payment processing</li>
                        <li>✓ Instant payment confirmation</li>
                        <li>✓ Auto-generated 80G receipt</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;