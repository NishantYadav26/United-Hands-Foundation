import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/admin-login`, formData);
      localStorage.setItem('uhf_admin_token', response.data.access_token);
      toast.success('Login successful!');
      navigate('/uhf-admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: 'linear-gradient(135deg, #0A1128 0%, #1C2951 100%)'
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="mx-auto mb-4" size={64} style={{color: '#3498DB'}} />
          <h1 
            className="text-4xl font-medium mb-2"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
          >
            Admin <span className="text-gradient-blue">Portal</span>
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            United Hands Foundation Command Center
          </p>
        </div>

        <div className="glass-morph p-8 rounded">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#3498DB] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="unitedhandsfoundation4@gmail.com"
                className="w-full bg-[#1C2951] border blue-border rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#3498DB]"
                data-testid="admin-email-input"
              />
            </div>

            <div>
              <label className="block text-[#3498DB] text-xs tracking-[0.2em] uppercase font-bold mb-3">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full bg-[#1C2951] border blue-border rounded px-4 py-3 text-[#F5F5F7] focus:outline-none focus:border-[#3498DB]"
                data-testid="admin-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3"
              data-testid="admin-login-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#1C2951]/50 border blue-border rounded">
            <p className="text-[#A1A1AA] text-xs text-center">
              🔐 Authorized access only. Only registered admin email can access this portal.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-[#3498DB] hover:text-[#5DADE2] text-sm transition-colors">
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;