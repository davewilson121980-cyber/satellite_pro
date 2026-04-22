import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogIn, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="app-header glass">
      <Link to="/" className="logo">🛰️ GeoAnalytics <span>Pro</span></Link>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/pricing">Piani</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      </nav>
      <div className="auth-actions">
        {isAuthenticated ? (
          <>
            <span className="user-badge"><User size={14} /> {user?.name} <span className="tier-badge">{user?.tier}</span></span>
            <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost"><LogOut size={16} /> Esci</button>
          </>
        ) : (
          <Link to="/login" className="btn-primary"><LogIn size={16} /> Accedi</Link>
        )}
      </div>
    </header>
  );
};
