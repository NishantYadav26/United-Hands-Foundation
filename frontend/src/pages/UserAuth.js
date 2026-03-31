import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', pan: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post(`${API}/auth/login`, { email: form.email, password: form.password });
        const { access_token, user: userData } = response.data;
        if (userData.role === 'admin') {
          localStorage.setItem('uhf_admin_token', access_token);
          localStorage.setItem('uhf_user_token', access_token);
          localStorage.setItem('uhf_user_data', JSON.stringify(userData));
          toast.success(`Welcome back, ${userData.name}!`);
          navigate('/uhf-admin/dashboard');
          window.location.reload();
        } else {
          localStorage.setItem('uhf_user_token', access_token);
          localStorage.setItem('uhf_user_data', JSON.stringify(userData));
          toast.success(`Welcome back, ${userData.name}!`);
          navigate('/');
          window.location.reload();
        }
      } else {
        if (!form.name || !form.email || !form.password) {
          toast.error('Please fill all required fields');
          setLoading(false);
          return;
        }
        const response = await axios.post(`${API}/auth/register`, { name: form.name, email: form.email, password: form.password, phone: form.phone, pan: form.pan });
        localStorage.setItem('uhf_user_token', response.data.access_token);
        localStorage.setItem('uhf_user_data', JSON.stringify(response.data.user));
        toast.success(`Welcome to UHF, ${response.data.user.name}!`);
        navigate('/');
        window.location.reload();
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <div className="card-elevated p-8 sm:p-10 rounded-lg" data-testid="auth-form-container">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-medium mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                {isLogin ? 'Welcome Back' : 'Join Our Mission'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {isLogin ? 'Track your donations and impact' : 'Create an account to support our causes'}
              </p>
            </div>

            {/* Toggle */}
            <div className="flex mb-8 rounded overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
              <button
                onClick={() => setIsLogin(true)}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ background: isLogin ? 'var(--accent-teal)' : 'transparent', color: isLogin ? '#fff' : 'var(--text-muted)' }}
                data-testid="auth-login-tab"
              >
                <LogIn size={16} /> Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className="flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ background: !isLogin ? 'var(--accent-teal)' : 'transparent', color: !isLogin ? '#fff' : 'var(--text-muted)' }}
                data-testid="auth-register-tab"
              >
                <UserPlus size={16} /> Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input
                  type="text" placeholder="Full Name *" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                  style={inputStyle} data-testid="auth-name-input"
                />
              )}
              <input
                type="email" placeholder="Email Address *" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded px-4 py-3 text-sm focus:outline-none"
                style={inputStyle} data-testid="auth-email-input"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Password *" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded px-4 py-3 text-sm focus:outline-none pr-12"
                  style={inputStyle} data-testid="auth-password-input"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && (
                <>
                  <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="auth-phone-input" />
                  <input type="text" placeholder="PAN Number (for 80G receipts)" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })} className="w-full rounded px-4 py-3 text-sm focus:outline-none" style={inputStyle} data-testid="auth-pan-input" />
                </>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="auth-submit-btn">
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserAuth;
