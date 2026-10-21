import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../redux/accountSlice';
import { 
  Send, 
  ArrowDownRight, 
  Smartphone, 
  HandCoins, 
  PlusCircle, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  RefreshCw
} from 'lucide-react';

import TransferModal from './TransferModal';
import WithdrawModal from './WithdrawModal';
import BillsModal from './BillsModal';
import LoanModal from './LoanModal';
import DepositModal from './DepositModal';
import ReceiptModal from './ReceiptModal';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, recentTransactions, myLoans, loading } = useSelector((state) => state.account);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'transfer' | 'withdraw' | 'bills' | 'loan' | 'deposit'
  const [selectedTx, setSelectedTx] = useState(null);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handleCopy = () => {
    if (user?.accountNumber) {
      navigator.clipboard.writeText(user.accountNumber);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (filterType !== 'ALL') {
      if (filterType === 'TRANSFERS' && !tx.type.includes('TRANSFER')) return false;
      if (filterType === 'BILLS' && tx.type !== 'BILL_PAYMENT') return false;
      if (filterType === 'WITHDRAWALS' && tx.type !== 'WITHDRAWAL') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchCounter = tx.counterparty?.name?.toLowerCase().includes(q);
      const matchRef = tx.reference?.toLowerCase().includes(q);
      if (!matchDesc && !matchCounter && !matchRef) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner: User Greeting & Quick Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Hello, {user?.name || 'Customer'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Welcome to your digital dashboard. Transfer funds, pay bills, and manage credit.
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchDashboard())}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid: Financial Card + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Sleek Digital Black Card */}
        <div style={{
          background: 'linear-gradient(135deg, #131b2e 0%, #0a0f1d 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 26px',
          boxShadow: 'var(--shadow-md), 0 0 40px rgba(16, 185, 129, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 220
        }}>
          {/* Subtle watermark badge */}
          <div style={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Card Top */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                Available Balance
              </div>
              <div style={{ 
                fontSize: '2.2rem', 
                fontWeight: 700, 
                fontFamily: 'var(--font-mono)',
                color: '#ffffff',
                letterSpacing: '-0.03em'
              }}>
                ${(user?.balance !== undefined ? user.balance : 0).toLocaleString()}
              </div>
            </div>
            {/* Card Chip / Logo */}
            <div style={{
              width: 44,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              opacity: 0.85,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }} />
          </div>

          {/* Card Bottom */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Account Number:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', letterSpacing: '0.08em' }}>
                  {user?.accountNumber || '—'}
                </span>
                <button onClick={handleCopy} title="Copy Account Number" style={{ color: 'var(--text-muted)' }}>
                  {copiedAcc ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user?.name || 'Valued Client'}
              </div>
            </div>

            <span className={`badge ${user?.status === 'banned' ? 'badge-banned' : 'badge-active'}`}>
              {user?.status || 'active'}
            </span>
          </div>
        </div>

        {/* Quick Action Matrix */}
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Quick Services
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {/* Send Money */}
              <button
                onClick={() => setModalType('transfer')}
                className="btn btn-secondary"
                style={{
                  flexDirection: 'column',
                  padding: '16px 10px',
                  gap: 8,
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                  height: '100%'
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                  <Send size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Send Money</span>
              </button>

              {/* Withdraw */}
              <button
                onClick={() => setModalType('withdraw')}
                className="btn btn-secondary"
                style={{
                  flexDirection: 'column',
                  padding: '16px 10px',
                  gap: 8,
                  height: '100%'
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
                  <ArrowDownRight size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Withdraw</span>
              </button>

              {/* Pay Bills */}
              <button
                onClick={() => setModalType('bills')}
                className="btn btn-secondary"
                style={{
                  flexDirection: 'column',
                  padding: '16px 10px',
                  gap: 8,
                  height: '100%'
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
                  <Smartphone size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Utilities & Bills</span>
              </button>

              {/* Request Loan */}
              <button
                onClick={() => setModalType('loan')}
                className="btn btn-secondary"
                style={{
                  flexDirection: 'column',
                  padding: '16px 10px',
                  gap: 8,
                  height: '100%'
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <HandCoins size={18} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Apply Loan</span>
              </button>
            </div>
          </div>

          {/* Top up helper button */}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Need testing credit?</span>
            <button
              onClick={() => setModalType('deposit')}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <PlusCircle size={14} />
              <span>Top Up Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Total Inflow (Received)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            +${(stats?.totalReceived || 0).toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Total Outflow (Spent/Sent)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
            -${(stats?.totalSent || 0).toLocaleString()}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Completed Transactions</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {stats?.transactionCount || 0}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Pending Loan Reviews</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
            {stats?.pendingLoansCount || 0}
          </div>
        </div>
      </div>

      {/* Loan applications banner if user has any loans */}
      {myLoans && myLoans.length > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>My Loan Applications</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {myLoans.map((loan) => (
              <div key={loan._id} style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    ${Number(loan.amount).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {loan.purpose || 'Personal Loan'} ({loan.durationMonths} mos)
                  </div>
                </div>
                <span className={`badge ${
                  loan.status === 'approved' ? 'badge-approved' : 
                  loan.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                }`}>
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Recent Activity</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest account debits, credits, and bills</p>
          </div>

          {/* Filter Pills & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
              {['ALL', 'TRANSFERS', 'BILLS', 'WITHDRAWALS'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    background: filterType === f ? 'var(--bg-elevated)' : 'transparent',
                    color: filterType === f ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.78rem', width: 170 }}
              />
            </div>
          </div>
        </div>

        {/* Transaction Table / List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            No transactions found for current filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTransactions.map((tx) => {
              const isCredit = ['TRANSFER_IN', 'DEPOSIT', 'BONUS', 'LOAN_DISBURSEMENT'].includes(tx.type);
              return (
                <div
                  key={tx._id}
                  onClick={() => setSelectedTx(tx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                >
                  {/* Left: Icon & Description */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCredit ? 'var(--accent-emerald)' : '#fb7185'
                    }}>
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: 8 }}>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{tx.reference?.substring(0, 14)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Receipt prompt */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: isCredit ? 'var(--accent-emerald)' : '#f87171'
                    }}>
                      {isCredit ? '+' : '-'}${Number(tx.amount || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <Eye size={11} /> View Receipt
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransferModal isOpen={modalType === 'transfer'} onClose={() => setModalType(null)} />
      <WithdrawModal isOpen={modalType === 'withdraw'} onClose={() => setModalType(null)} />
      <BillsModal isOpen={modalType === 'bills'} onClose={() => setModalType(null)} />
      <LoanModal isOpen={modalType === 'loan'} onClose={() => setModalType(null)} />
      <DepositModal isOpen={modalType === 'deposit'} onClose={() => setModalType(null)} />
      <ReceiptModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}