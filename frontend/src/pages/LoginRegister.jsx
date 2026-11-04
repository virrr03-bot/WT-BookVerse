import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials, selectIsAuthenticated, switchMockRole } from '../store/authSlice';
import api from '../services/api';
import { BookOpen, LogIn, UserPlus, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export const LoginRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerRole, setRegisterRole] = useState('customer');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const redirectByRole = (role) => {
    if (fromPath && fromPath !== '/login') {
      navigate(fromPath, { replace: true });
      return;
    }
    switch (role) {
      case 'fresh_seller':
        navigate('/seller/fresh');
        break;
      case 'used_seller':
        navigate('/seller/used');
        break;
      case 'marketing':
        navigate('/marketing/campaigns');
        break;
      case 'support':
        navigate('/support/tickets');
        break;
      case 'customer':
      default:
        navigate('/');
        break;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.auth.login(loginEmail, loginPassword);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      redirectByRole(data.user.role);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (registerPassword !== registerConfirm) {
      setRegisterError('Passwords do not match. Please verify and try again.');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.auth.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole
      });

      dispatch(setCredentials({ user: data.user, token: data.token }));
      setRegisterSuccess(`Account registered as ${data.user.role}! Redirecting...`);

      setTimeout(() => {
        redirectByRole(data.user.role);
      }, 1000);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (roleKey) => {
    dispatch(switchMockRole(roleKey));
    redirectByRole(roleKey);
  };

  return (
    <div className="container" style={{ maxWidth: '520px', marginTop: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <BookOpen size={26} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome to BookVerse</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Multi-role book exchange platform for readers, publishers & curators
          </p>
        </div>

        {/* 1-Click Multi-Role Fast Login Toolbar */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#475569',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Shield size={14} color="#4f46e5" />
            Instant Test Login as Role:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
            <button
              onClick={() => handleQuickDemoLogin('customer')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              👤 Customer
            </button>
            <button
              onClick={() => handleQuickDemoLogin('fresh_seller')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🏢 Fresh Seller
            </button>
            <button
              onClick={() => handleQuickDemoLogin('used_seller')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📚 2nd Hand Seller
            </button>
            <button
              onClick={() => handleQuickDemoLogin('marketing')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📢 Marketing Team
            </button>
            <button
              onClick={() => handleQuickDemoLogin('support')}
              className="btn btn-secondary btn-sm"
              style={{ gridColumn: 'span 2', justifyContent: 'center' }}
            >
              🎧 Support Helpdesk
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'login' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'login' ? '2px solid #4f46e5' : '2px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <LogIn size={16} />
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '0.65rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'register' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'register' ? '2px solid #4f46e5' : '2px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={16} />
            Register
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            {loginError && (
              <div style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="customer@bookverse.com"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
              Sign In to Account
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {registerError && (
              <div style={{
                background: '#fef2f2',
                color: '#991b1b',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={16} />
                {registerError}
              </div>
            )}

            {registerSuccess && (
              <div style={{
                background: '#ecfdf5',
                color: '#065f46',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle size={16} />
                {registerSuccess}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maya Lin"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="maya@example.com"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>

            {/* Role Selector Dropdown (Required by specification) */}
            <div className="form-group">
              <label className="form-label">Account Role Type</label>
              <select
                className="form-select"
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
              >
                <option value="customer">Customer (Buy Books & Submit Orders)</option>
                <option value="fresh_seller">Fresh Seller (Publishers of Brand New Books)</option>
                <option value="used_seller">2nd Hand Seller (Pre-Owned & Vintage Books)</option>
                <option value="marketing">Marketing Specialist (Campaigns & Banners)</option>
                <option value="support">Support Agent (Helpdesk & Ticket Management)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Your selected role grants access to its dedicated dashboard features.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                required
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
