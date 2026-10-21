import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withdrawFunds, clearAccountStatus } from '../redux/accountSlice';
import { X, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

const BANKS = [
  'JPMorgan Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Apex International Bank',
  'Zenith Bank',
  'GTBank (Guaranty Trust)',
  'Barclays'
];

export default function WithdrawModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { actionLoading, error, actionSuccess } = useSelector((state) => state.account);

  const [bankName, setBankName] = useState(BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(user?.name || '');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearAccountStatus());
    setAmount('');
    setAccountNumber('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(withdrawFunds({
      amount: Number(amount),
      bankName,
      accountNumber,
      accountName
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
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185'
            }}>
              <ArrowDownRight size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Withdraw Funds</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Transfer balance to your external bank</p>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Withdrawal Processed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              {actionSuccess}
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label className="form-label">Destination Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="form-select"
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Account Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 0291823910"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Beneficiary Account Name</label>
              <input
                type="text"
                required
                placeholder="Name on account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Withdrawal Amount ($ USD)</label>
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
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !amount || Number(amount) <= 0 || Number(amount) > (user?.balance || 0)}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {actionLoading ? 'Processing...' : `Withdraw $${Number(amount || 0).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}