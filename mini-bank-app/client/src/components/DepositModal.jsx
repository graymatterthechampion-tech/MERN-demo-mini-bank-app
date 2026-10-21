import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { depositFunds, clearAccountStatus } from '../redux/accountSlice';
import { X, PlusCircle, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';

export default function DepositModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { actionLoading, error, actionSuccess } = useSelector((state) => state.account);

  const [amount, setAmount] = useState('500');
  const [channel, setChannel] = useState('Instant Card Checkout');

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearAccountStatus());
    setAmount('500');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(depositFunds({
      amount: Number(amount),
      channel
    }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Top Up Balance</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Simulated instant wallet deposit</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Deposit Successful!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              {actionSuccess}
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="form-select"
              >
                <option value="Instant Card Checkout">Instant Card Checkout (Visa/Mastercard)</option>
                <option value="Bank Direct Wire">Bank Direct Wire</option>
                <option value="Crypto Deposit">Crypto / Stablecoin Gateway</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Amount ($ USD)</label>
              <input
                type="number"
                required
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[100, 500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    +${preset}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !amount || Number(amount) <= 0}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {actionLoading ? 'Processing...' : `Deposit $${Number(amount || 0).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}