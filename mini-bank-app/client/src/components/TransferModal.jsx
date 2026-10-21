import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendTransfer, clearAccountStatus } from '../redux/accountSlice';
import api from '../services/api';
import { X, Send, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function TransferModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { actionLoading, error, actionSuccess } = useSelector((state) => state.account);

  const [recipientAcc, setRecipientAcc] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Lookup recipient when account number is 10 digits
  useEffect(() => {
    const clean = recipientAcc.trim();
    if (clean.length === 10) {
      if (clean === user?.accountNumber) {
        setLookupError('You cannot transfer money to your own account.');
        setRecipientInfo(null);
        return;
      }
      setLookingUp(true);
      setLookupError('');
      api.get(`/auth/lookup/${clean}`)
        .then((res) => {
          setRecipientInfo(res.data);
          setLookupError('');
        })
        .catch((err) => {
          setRecipientInfo(null);
          setLookupError(err.response?.data?.message || 'Recipient account not found.');
        })
        .finally(() => setLookingUp(false));
    } else {
      setRecipientInfo(null);
      setLookupError('');
    }
  }, [recipientAcc, user?.accountNumber]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearAccountStatus());
    setRecipientAcc('');
    setRecipientInfo(null);
    setAmount('');
    setDescription('');
    setLookupError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientInfo && !recipientAcc) return;
    dispatch(sendTransfer({
      recipientAccountNumber: recipientAcc.trim(),
      amount: Number(amount),
      description: description.trim()
    }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <Send size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Send Money</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Direct user-to-user account transfer</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="toast-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Transfer Successful!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              {actionSuccess}
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Available balance tip */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Available Balance</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                ${(user?.balance || 0).toLocaleString()}
              </span>
            </div>

            {/* Recipient Account Number */}
            <div className="form-group">
              <label className="form-label">Recipient 10-Digit Account Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 1010001001"
                  value={recipientAcc}
                  onChange={(e) => setRecipientAcc(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                />
                {lookingUp && (
                  <div style={{ position: 'absolute', right: 12, top: 12, color: 'var(--text-dim)' }}>
                    <Loader2 size={16} className="spin-animation" />
                  </div>
                )}
              </div>

              {/* Recipient Lookup Result */}
              {recipientInfo && (
                <div style={{
                  marginTop: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8125rem',
                  color: '#34d399'
                }}>
                  <User size={14} />
                  <span>Verified: <strong>{recipientInfo.name}</strong> ({recipientInfo.email})</span>
                </div>
              )}

              {lookupError && (
                <div style={{ fontSize: '0.8rem', color: '#fb7185', marginTop: 4 }}>
                  {lookupError}
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount ($ USD)</label>
              <input
                type="number"
                required
                min="1"
                max={user?.balance || 0}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 6 }}
                  >
                    ${preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(String(user?.balance || 0))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 6, color: 'var(--accent-emerald)' }}
                >
                  All
                </button>
              </div>
            </div>

            {/* Description / Note */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Reference Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Dinner split, Freelance pay"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !amount || Number(amount) <= 0 || Number(amount) > (user?.balance || 0) || !recipientAcc}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {actionLoading ? 'Processing...' : `Send $${Number(amount || 0).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}