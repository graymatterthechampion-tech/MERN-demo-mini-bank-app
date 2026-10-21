import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { payAirtime, payData, payElectricity, clearAccountStatus } from '../redux/accountSlice';
import { X, Smartphone, Wifi, Zap, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

const TELCOS = [
  { id: 'mtn', name: 'MTN Network', color: '#eab308' },
  { id: 'airtel', name: 'Airtel Telecom', color: '#ef4444' },
  { id: 'glo', name: 'Glo Mobile', color: '#22c55e' },
  { id: '9mobile', name: '9mobile', color: '#14b8a6' }
];

const DATA_PLANS = [
  { id: 'p1', name: '1.5GB Monthly Plan', amount: 3 },
  { id: 'p2', name: '4.5GB Monthly Plan', amount: 8 },
  { id: 'p3', name: '12GB High-Speed Plan', amount: 18 },
  { id: 'p4', name: '30GB Pro Data Plan', amount: 35 },
  { id: 'p5', name: '75GB Unlimited Ultra', amount: 70 }
];

const DISCOS = [
  { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
  { id: 'ekedc', name: 'Eko Electricity (EKEDC)' },
  { id: 'aedc', name: 'Abuja Electricity (AEDC)' },
  { id: 'ibedc', name: 'Ibadan Electricity (IBEDC)' },
  { id: 'eedc', name: 'Enugu Electricity (EEDC)' }
];

export default function BillsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { actionLoading, error, actionSuccess } = useSelector((state) => state.account);

  const [activeTab, setActiveTab] = useState('airtime');

  // Airtime state
  const [airtimeProvider, setAirtimeProvider] = useState('mtn');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('10');

  // Data state
  const [dataProvider, setDataProvider] = useState('mtn');
  const [dataPhone, setDataPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(DATA_PLANS[1]);

  // Electricity state
  const [disco, setDisco] = useState(DISCOS[0].id);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('Prepaid');
  const [electricityAmount, setElectricityAmount] = useState('25');
  const [generatedToken, setGeneratedToken] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearAccountStatus());
    setGeneratedToken('');
    onClose();
  };

  const handleAirtimeSubmit = (e) => {
    e.preventDefault();
    dispatch(payAirtime({
      provider: airtimeProvider,
      phone: airtimePhone,
      amount: Number(airtimeAmount)
    }));
  };

  const handleDataSubmit = (e) => {
    e.preventDefault();
    dispatch(payData({
      provider: dataProvider,
      phone: dataPhone,
      planName: selectedPlan.name,
      amount: selectedPlan.amount
    }));
  };

  const handleElectricitySubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(payElectricity({
      disco,
      meterNumber,
      meterType,
      amount: Number(electricityAmount)
    }));
    if (payElectricity.fulfilled.match(action)) {
      setGeneratedToken(action.payload.token);
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Utility & Bill Payments</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Simulated airtime, internet data, and electricity</p>
          </div>
          <button onClick={handleClose} className="btn-outline" style={{ padding: 6, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('airtime'); dispatch(clearAccountStatus()); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: activeTab === 'airtime' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'airtime' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Smartphone size={14} />
            Airtime
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('data'); dispatch(clearAccountStatus()); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: activeTab === 'data' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'data' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Wifi size={14} />
            Data
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('electricity'); dispatch(clearAccountStatus()); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 3px)',
              background: activeTab === 'electricity' ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === 'electricity' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <Zap size={14} />
            Electricity
          </button>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess && !generatedToken ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>Transaction Completed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
              {actionSuccess}
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        ) : generatedToken ? (
          /* Electricity Token Result */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Zap size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 6 }}>Token Generated!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 16 }}>
              Enter this 20-digit token into your prepaid meter keypad:
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--accent-emerald)',
              letterSpacing: '0.08em',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}>
              <span>{generatedToken}</span>
              <button onClick={handleCopyToken} className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Copy Token">
                {copiedToken ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
              </button>
            </div>

            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          /* Tab Forms */
          <div>
            {/* 1. AIRTIME */}
            {activeTab === 'airtime' && (
              <form onSubmit={handleAirtimeSubmit}>
                <div className="form-group">
                  <label className="form-label">Network Provider</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {TELCOS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAirtimeProvider(t.id)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 8,
                          border: `1px solid ${airtimeProvider === t.id ? t.color : 'var(--border)'}`,
                          background: airtimeProvider === t.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {t.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555 019 2834"
                    value={airtimePhone}
                    onChange={(e) => setAirtimePhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Recharge Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={user?.balance || 0}
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(e.target.value)}
                    className="form-input"
                  />
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAirtimeAmount(amt.toString())}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !airtimePhone || !airtimeAmount || Number(airtimeAmount) > (user?.balance || 0)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {actionLoading ? 'Purchasing...' : `Recharge $${airtimeAmount} Airtime`}
                </button>
              </form>
            )}

            {/* 2. DATA BUNDLE */}
            {activeTab === 'data' && (
              <form onSubmit={handleDataSubmit}>
                <div className="form-group">
                  <label className="form-label">Network Provider</label>
                  <select
                    value={dataProvider}
                    onChange={(e) => setDataProvider(e.target.value)}
                    className="form-select"
                  >
                    {TELCOS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Data Bundle Plan</label>
                  <select
                    value={selectedPlan.id}
                    onChange={(e) => {
                      const p = DATA_PLANS.find(plan => plan.id === e.target.value);
                      if (p) setSelectedPlan(p);
                    }}
                    className="form-select"
                  >
                    {DATA_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Recipient Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555 019 2834"
                    value={dataPhone}
                    onChange={(e) => setDataPhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !dataPhone || selectedPlan.amount > (user?.balance || 0)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {actionLoading ? 'Purchasing...' : `Buy ${selectedPlan.name} ($${selectedPlan.amount})`}
                </button>
              </form>
            )}

            {/* 3. ELECTRICITY */}
            {activeTab === 'electricity' && (
              <form onSubmit={handleElectricitySubmit}>
                <div className="form-group">
                  <label className="form-label">Electricity Disco</label>
                  <select
                    value={disco}
                    onChange={(e) => setDisco(e.target.value)}
                    className="form-select"
                  >
                    {DISCOS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Meter Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['Prepaid', 'Postpaid'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMeterType(m)}
                        style={{
                          padding: '8px 0',
                          borderRadius: 8,
                          border: `1px solid ${meterType === m ? 'var(--accent-emerald)' : 'var(--border)'}`,
                          background: meterType === m ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.2)',
                          color: '#fff',
                          fontSize: '0.8125rem',
                          fontWeight: 500
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Meter Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45019283719"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max={user?.balance || 0}
                    value={electricityAmount}
                    onChange={(e) => setElectricityAmount(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !meterNumber || !electricityAmount || Number(electricityAmount) > (user?.balance || 0)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 0' }}
                >
                  {actionLoading ? 'Processing...' : `Pay $${electricityAmount} Electricity`}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}