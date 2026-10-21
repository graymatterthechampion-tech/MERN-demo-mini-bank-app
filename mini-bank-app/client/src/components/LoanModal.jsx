import React from 'react';
import { X, CheckCircle, Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ transaction, onClose }) {
  if (!transaction) return null;

  const isCredit = ['TRANSFER_IN', 'DEPOSIT', 'BONUS', 'LOAN_DISBURSEMENT'].includes(transaction.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}>
              <Receipt size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Transaction Receipt</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official platform transfer record</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Amount Hero */}
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          borderBottom: '1px dashed var(--border)',
          marginBottom: 20
        }}>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 700,
            color: isCredit ? 'var(--accent-emerald)' : 'var(--text-main)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 4
          }}>
            {isCredit ? '+' : '-'}${Number(transaction.amount || 0).toLocaleString()}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.8125rem' }}>
            <CheckCircle size={14} />
            <span>Completed Successfully</span>
          </div>
        </div>

        {/* Breakdown details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Transaction Type</span>
            <span style={{ fontWeight: 600 }}>{transaction.type}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Description</span>
            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{transaction.description}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Counterparty</span>
            <span style={{ fontWeight: 500 }}>
              {transaction.counterparty?.name || 'MiniBank Apex'}
            </span>
          </div>

          {transaction.counterparty?.accountNumber && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account / Dest</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{transaction.counterparty.accountNumber}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Reference ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              {transaction.reference}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Timestamp</span>
            <span style={{ color: 'var(--text-dim)' }}>
              {new Date(transaction.createdAt).toLocaleString()}
            </span>
          </div>

          {transaction.balanceAfter !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance After</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                ${Number(transaction.balanceAfter).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}