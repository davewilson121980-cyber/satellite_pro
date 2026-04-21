import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type RegisterData } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '', password: '', name: '', company: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setMessage('Devi accettare i termini per registrarti');
      return;
    }
    const result = await register(formData);
    setMessage(result.message);
    if (result.success) setRegistered(true);
  };

  if (registered) {
    return (
      <div className="auth-container">
        <div className="auth-card glass verification-card animate-fade">
          <div className="verification-icon text-success">✓</div>
          <h3>Registrazione Completata</h3>
          <p className="subtitle">Abbiamo inviato un'email di verifica a <strong>{formData.email}</strong></p>
          <p className="text-sm text-muted">Clicca sul link nell'email per attivare il tuo account. Se non vedi l'email, controlla lo spam.</p>
          <div className="flex flex-col gap-2 mt-4">
            <Link to="/login" className="btn btn-primary w-full">Vai al Login</Link>
            <button 
              className="btn btn-outline w-full"
              onClick={() => setRegistered(false)}
            >
              Torna alla Registrazione
            </button>
          </div>
          <p className="text-sm mt-4">
            Non hai ricevuto l'email?{' '}
            <button 
              className="resend-btn"
              onClick={async () => {
                const ok = await useAuthStore.getState().resendVerification(formData.email);
                setMessage(ok ? 'Email reinviata!' : 'Errore nel reinvio');
              }}
            >
              Reinviata ora
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade">
        <h2>Crea Account</h2>
        <p className="subtitle">Accedi a dati satellitari avanzati e strumenti di analisi professionale</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Nome Completo *</label>
            <div className="input-field flex items-center gap-2">
              <User size={16} className="text-muted" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Mario Rossi"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Aziendale *</label>
            <div className="input-field flex items-center gap-2">
              <Mail size={16} className="text-muted" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nome@azienda.it"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password *</label>
            <div className="input-field flex items-center gap-2">
              <Lock size={16} className="text-muted" />
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Minimo 8 caratteri"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full bg-transparent border-none outline-none"
              />
              <button 
                type="button" 
                className="toggle-pass" 
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Nascondi password' : 'Mostra password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formData.password.length > 0 && formData.password.length < 8 && (
              <span className="error-msg">La password deve avere almeno 8 caratteri</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="company">Azienda (opzionale)</label>
            <div className="input-field flex items-center gap-2">
              <Building2 size={16} className="text-muted" />
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Nome della tua azienda"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreeTerms} 
              onChange={e => setAgreeTerms(e.target.checked)} 
              className="accent-accent"
            />
            <span className="text-muted">
              Accetto i <a href="#" className="text-accent hover:underline">Termini di Servizio</a> e l'<a href="#" className="text-accent hover:underline">Informativa Privacy</a>
            </span>
          </label>

          {error && <div className="error-msg">{error}</div>}
          {message && !error && <div className="text-success text-sm">{message}</div>}

          <button type="submit" disabled={isLoading || !agreeTerms || formData.password.length < 8} className="btn btn-primary w-full">
            {isLoading ? <><Loader2 className="spin" size={18} /> Creazione account...</> : 'Crea Account Gratuito'}
          </button>
        </form>

        <div className="auth-footer">
          Hai già un account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">Accedi qui</Link>
        </div>
      </div>
    </div>
  );
};
