import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { verifyEmail, resendVerification } = useAuthStore();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = decodeURIComponent(searchParams.get('email') || '');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Parametri di verifica mancanti');
      return;
    }
    
    const verify = async () => {
      const success = await verifyEmail(token, email);
      setStatus(success ? 'success' : 'error');
      setMessage(success ? 'Account attivato con successo!' : 'Token non valido o già utilizzato');
    };
    verify();
  }, [token, email, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;
    const success = await resendVerification(email);
    setMessage(success ? 'Email di verifica reinviata!' : 'Errore nel reinvio');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass verification-card animate-fade">
        {status === 'loading' && (
          <>
            <Loader2 className="spin" size={48} />
            <h3>Verifica in corso...</h3>
            <p className="subtitle">Stiamo attivando il tuo account</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-success" />
            <h3>Account Attivato!</h3>
            <p className="subtitle">{message}</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full mt-4">
              Vai alla Dashboard
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle size={48} className="text-error" />
            <h3>Verifica Fallita</h3>
            <p className="subtitle">{message}</p>
            {email && (
              <button onClick={handleResend} className="btn btn-outline w-full mt-4">
                <Mail size={16} /> Reinvia Email di Verifica
              </button>
            )}
            <button onClick={() => navigate('/register')} className="btn btn-ghost w-full mt-2">
              Torna alla Registrazione
            </button>
          </>
        )}
      </div>
    </div>
  );
};
