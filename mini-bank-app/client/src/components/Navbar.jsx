import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  ShieldAlert, 
  LayoutDashboard, 
  Settings, 
  User 
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    if (user?.accountNumber) {
      navigator.clipboard.writeText(user.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ 
              fontSize: '1.15rem', 
              fontWeight: 700, 
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              Mini<span style={{ color: 'var(--accent-emerald)' }}>Bank</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              SECURE PLATFORM
            </div>
          </div>
        </div>

        {/* View Switcher for Admin */}
        {user?.role === 'admin' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: 3,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setActiveView('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                background: activeView === 'dashboard' ? 'var(--bg-elevated)' : 'transparent',
                color: activeView === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              <LayoutDashboard size={14} />
              My Account
            </button>
            <button
              onClick={() => setActiveView('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                background: activeView === 'admin' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                color: activeView === 'admin' ? '#d8b4fe' : 'var(--text-muted)'
              }}
            >
              <ShieldAlert size={14} />
              Admin Console
            </button>
          </div>
        )}

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Account Number Pill */}
          <button
            onClick={handleCopyAccount}
            title="Click to copy account number"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Acct:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600 }}>
              {user?.accountNumber || '—'}
            </span>
            {copied ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <Copy size={14} />
            )}
          </button>

          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: user?.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${user?.role === 'admin' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: user?.role === 'admin' ? '#c084fc' : '#60a5fa'
            }}>
              <User size={16} />
            </div>
            <div style={{ display: 'none', md: 'block', textAlign: 'left' }} className="user-text-meta">
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {user?.role}
                </span>
                {user?.status === 'banned' && (
                  <span className="badge badge-banned" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    BANNED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => dispatch(logout())}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8125rem' }}
            title="Sign out"
          >
            <LogOut size={14} />
            <span style={{ display: 'none', md: 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}