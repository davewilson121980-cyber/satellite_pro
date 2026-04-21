import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Check, Zap, Crown, ArrowRight } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const { user, upgradeTier, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleSubscribe = (tier: 'pro' | 'enterprise') => {
    if (!isAuthenticated) { navigate('/login'); return; }
    // 🔧 INTEGRAZIONE STRIPE REALE:
    // 1. Chiama il tuo backend: POST /api/create-checkout-session { tier }
    // 2. Ricevi Stripe Checkout URL
    // 3. window.location.href = checkoutUrl
    // Qui simuliamo il successo per demo:
    upgradeTier(tier);
    alert(`✅ Piano ${tier.toUpperCase()} attivato! (In produzione: redirect a Stripe Checkout)`);
  };

  const plans = [
    { id: 'free', name: 'Explorer', price: '€0', features: ['Mappa satellitare base', 'Filtri UV/IR semplici', 'Dati meteo last 24h', 'Esportazione CSV'], icon: <Check size={18} />, cta: null },
    { id: 'pro', name: 'Analyst', price: '€29/mese', features: ['Layer multitemporali', 'Filtri NDVI/Termici GPU', 'Storico 30 giorni', 'Export GeoJSON + Report', 'Supporto prioritario'], icon: <Zap size={18} />, cta: () => handleSubscribe('pro'), popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['API illimitate', 'ML classificationi custom', 'Webhook & Integrazioni', 'SLA 99.9% + Account Manager', 'On-premise deployment'], icon: <Crown size={18} />, cta: () => alert('📧 Contatta sales@geoanalytics.it per preventivo') }
  ];

  return (
    <div className="pricing-grid">
      {plans.map(p => (
        <div key={p.id} className={`pricing-card glass ${p.popular ? 'popular' : ''}`}>
          <div className="card-header"><span className="card-icon">{p.icon}</span><h3>{p.name}</h3></div>
          <div className="price">{p.price}</div>
          <ul className="features">{p.features.map(f => <li key={f}><Check size={14} /> {f}</li>)}</ul>
          {p.cta && <button onClick={p.cta} className={`btn-${p.popular ? 'primary' : 'outline'}`}>
            {p.popular ? 'Attiva Prova Gratuita' : 'Contattaci'} <ArrowRight size={16} />
          </button>}
        </div>
      ))}
    </div>
  );
};
