import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, pass);
    if (ok) navigate('/dashboard');
    else setError('Credenziali non valide (min. 6 caratteri password)');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <h2>🛰️ Accedi a GeoAnalytics</h2>
        <p className="auth-sub">Accedi a dati satellitari, filtri spettrali e dashboard avanzate</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type={show ? 'text' : 'password'} placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required />
            <button type="button" className="toggle-pass" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <Loader2 className="spin" size={18} /> : 'Accedi'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/">← Torna alla Homepage</Link>
        </div>
      </div>
    </div>
  );
};
