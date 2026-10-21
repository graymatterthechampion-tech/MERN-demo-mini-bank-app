import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearAuthError } from '../redux/authSlice';
import { Building2, ArrowRight, ShieldCheck, Zap, UserCheck, AlertCircle } from 'lucide-react';

export default function AuthView() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(registerUser(formData));
    } else {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    }
  };

  const handleQuickLogin = (email, password) => {
    dispatch(clearAuthError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            marginBottom: 16
          }}>
            <Building2 size={28} />
          </div>
          <h1 style={{ 
            fontSize: '1.65rem', 
            fontWeight: 700, 
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            marginBottom: 6
          }}>
            Mini<span style={{ color: 'var(--accent-emerald)' }}>Bank</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isRegister ? 'Create your account with a unique 10-digit account number' : 'Welcome back, sign in to access your digital account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 24,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); dispatch(clearAuthError()); }}
            style={{
              padding: '9px 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: !isRegister ? 'var(--bg-elevated)' : 'transparent',
              color: !isRegister ? '#fff' : 'var(--text-muted)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); dispatch(clearAuthError()); }}
            style={{
              padding: '9px 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: isRegister ? 'var(--bg-elevated)' : 'transparent',
              color: isRegister ? '#fff' : 'var(--text-muted)'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="toast-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="user@minibank.com"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px 0', fontSize: '0.9375rem', fontWeight: 600 }}
          >
            {loading ? 'Processing...' : (
              <>
                <span>{isRegister ? 'Open Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Demo Logins
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> Instant Access
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@minibank.com', 'admin123')}
              className="btn btn-secondary"
              style={{ padding: '8px 10px', fontSize: '0.775rem', justifyContent: 'flex-start', background: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.25)' }}
            >
              <ShieldCheck size={14} color="#c084fc" />
              <span>Admin Desk</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john@minibank.com', 'user123')}
              className="btn btn-secondary"
              style={{ padding: '8px 10px', fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} color="#60a5fa" />
              <span>John Doe ($2.5k)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@minibank.com', 'user123')}
              className="btn btn-secondary"
              style={{ padding: '8px 10px', fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} color="#34d399" />
              <span>Sarah C. ($1.8k)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@minibank.com', 'user123')}
              className="btn btn-secondary"
              style={{ padding: '8px 10px', fontSize: '0.775rem', justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} color="#f59e0b" />
              <span>Alex R. ($750)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}