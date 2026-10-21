import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAdminStats, 
  fetchAdminUsers, 
  fetchAdminLoans, 
  fetchAdminTransactions,
  adminToggleBan,
  adminUpdateLoanStatus,
  adminCreateUser,
  adminEditUser,
  clearAdminStatus
} from '../redux/adminSlice';
import { 
  Users, 
  HandCoins, 
  Activity, 
  UserPlus, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Search, 
  RefreshCw,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';

export default function AdminPanel() {
  const dispatch = useDispatch();
  const { stats, users, loans, transactions, loading, actionLoading, error, successMessage } = useSelector((state) => state.admin);
  const { user: currentAdmin } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'loans' | 'transactions'
  const [userSearch, setUserSearch] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    balance: '1000'
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    balance: '0',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminLoans());
    dispatch(fetchAdminTransactions());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminLoans());
    dispatch(fetchAdminTransactions());
  };

  const handleToggleBan = (u) => {
    const shouldBan = u.status !== 'banned';
    if (window.confirm(`Are you sure you want to ${shouldBan ? 'BAN' : 'UNBAN'} user "${u.name}"?`)) {
      dispatch(adminToggleBan({ id: u._id, banned: shouldBan }));
    }
  };

  const handleLoanDecision = (loanId, status) => {
    const reason = status === 'rejected' ? prompt('Enter optional rejection reason:') || 'Administrative decline' : '';
    dispatch(adminUpdateLoanStatus({ id: loanId, status, rejectionReason: reason }));
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name,
      email: u.email,
      role: u.role,
      balance: String(u.balance),
      status: u.status
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    dispatch(adminCreateUser({
      name: newUserForm.name,
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role,
      balance: Number(newUserForm.balance)
    })).then((res) => {
      if (!res.error) {
        setShowCreateModal(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'user', balance: '1000' });
      }
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    dispatch(adminEditUser({
      id: editingUser._id,
      updates: {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
        balance: Number(editUserForm.balance),
        status: editUserForm.status
      }
    })).then((res) => {
      if (!res.error) {
        setShowEditModal(false);
        setEditingUser(null);
      }
    });
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.accountNumber?.includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-admin">ADMINISTRATOR DESK</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>
            Platform Administration
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Oversee all bank accounts, ban suspicious users, process credit reviews, and create accounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRefresh} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="toast-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="toast-success">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Admin Stats Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Total Registered Users</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {stats?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            {stats?.activeUsers || 0} active • {stats?.bannedUsers || 0} banned
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Platform Total Deposits</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            ${(stats?.totalPlatformBalances || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Across all bank wallets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Pending Loan Reviews</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
            {stats?.pendingLoansCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Requires credit decision
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Platform Total Transactions</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {stats?.totalTransactionsCount || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Ledger operations
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        gap: 16
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderBottom: activeTab === 'users' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
            color: activeTab === 'users' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <Users size={16} />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderBottom: activeTab === 'loans' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
            color: activeTab === 'loans' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <HandCoins size={16} />
          Loan Approvals Desk ({loans.filter(l => l.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderBottom: activeTab === 'transactions' ? '2px solid var(--accent-emerald)' : '2px solid transparent',
            color: activeTab === 'transactions' ? '#fff' : 'var(--text-muted)'
          }}
        >
          <Activity size={16} />
          Global Transactions Ledger ({transactions.length})
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: 20 }}>
          {/* Search bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search name, email, or account..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 32, fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Account #</th>
                  <th style={{ padding: '12px 14px' }}>Balance</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                      {u.accountNumber}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                      ${Number(u.balance || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${u.status === 'banned' ? 'badge-banned' : 'badge-active'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Edit user details"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        {String(u._id) !== String(currentAdmin?._id) && (
                          <button
                            onClick={() => handleToggleBan(u)}
                            className={u.status === 'banned' ? 'btn btn-secondary' : 'btn btn-danger'}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title={u.status === 'banned' ? 'Unban user' : 'Ban user'}
                          >
                            <Ban size={13} />
                            <span>{u.status === 'banned' ? 'Unban' : 'Ban'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LOAN APPROVALS DESK */}
      {activeTab === 'loans' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 14px' }}>Applicant</th>
                  <th style={{ padding: '12px 14px' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Tenure</th>
                  <th style={{ padding: '12px 14px' }}>Purpose</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
                      No loan applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  loans.map((l) => (
                    <tr key={l._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{l.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {l.accountNumber} ({l.userEmail})
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                        ${Number(l.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {l.durationMonths} months
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.purpose}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${
                          l.status === 'approved' ? 'badge-approved' :
                          l.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {l.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleLoanDecision(l._id, 'approved')}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <CheckCircle size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleLoanDecision(l._id, 'rejected')}
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Decision rendered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 14px' }}>Reference</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Description</th>
                  <th style={{ padding: '12px 14px' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Counterparty</th>
                  <th style={{ padding: '12px 14px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {t.reference}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-user" style={{ fontSize: '0.68rem' }}>{t.type}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {t.description}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      ${Number(t.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {t.counterparty?.name || 'MiniBank Apex'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create New User Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rachel@minibank.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="form-select"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Initial Balance Deposit ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={newUserForm.balance}
                  onChange={(e) => setNewUserForm({ ...newUserForm, balance: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ flex: 2 }}>
                  {actionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit Account Details</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Account #{editingUser.accountNumber}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Balance ($ USD)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editUserForm.balance}
                  onChange={(e) => setEditUserForm({ ...editUserForm, balance: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="form-select"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Status</label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="form-select"
                >
                  <option value="active">Active (Normal)</option>
                  <option value="banned">Banned (Suspended)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ flex: 2 }}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}