import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './redux/authSlice';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'admin'

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // If user is not admin, ensure view is dashboard
  useEffect(() => {
    if (user?.role !== 'admin' && activeView === 'admin') {
      setActiveView('dashboard');
    }
  }, [user, activeView]);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="app-container">
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        {activeView === 'admin' && user?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <Dashboard />
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        background: 'rgba(9, 13, 22, 0.7)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            MiniBank Platform ©️ {new Date().getFullYear()} • Secure Banking Sandbox
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>MongoDB + Mongoose</span>
            <span>•</span>
            <span>Express API</span>
            <span>•</span>
            <span>Redux Toolkit</span>
            <span>•</span>
            <span>Vite React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;