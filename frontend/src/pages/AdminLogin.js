import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import usePageRevealAnimation from '@/hooks/usePageRevealAnimation';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'https://united-hands-backend.onrender.com';
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  usePageRevealAnimation();

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
        background: 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-surface) 100%)'
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8 reveal-section">
          <Shield className="mx-auto mb-4" size={64} style={{color: 'var(--accent-teal)'}} />
          <h1 
            className="text-4xl font-medium mb-2"
            style={{fontFamily: 'Cormorant Garamond, serif'}}
          >
            Admin <span className="text-gradient-blue">Portal</span>
          </h1>
          <p className="text-sm" style={{color: 'var(--text-muted)'}}>
            United Hands Foundation Command Center
          </p>
        </div>

        <div className="glass-morph p-8 rounded reveal-section">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{color: 'var(--accent-teal)'}}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="admin@unitedhandsfoundation.org"
                className="w-full rounded px-4 py-3 focus:outline-none"
                style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
                data-testid="admin-email-input"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase font-bold mb-3" style={{color: 'var(--accent-teal)'}}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full rounded px-4 py-3 focus:outline-none"
                style={{background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'}}
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

          <div className="mt-6 p-4 rounded" style={{background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)'}}>
            <p className="text-xs text-center" style={{color: 'var(--text-muted)'}}>
              Authorized access only. Only registered admin email can access this portal.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm transition-colors" style={{color: 'var(--accent-teal)'}}>
            Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
