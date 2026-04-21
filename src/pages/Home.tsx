import React from 'react';
import { Link } from 'react-router-dom';
import { PricingSection } from '../components/Pricing/PricingSection';
import { Satellite, BarChart3, Shield, Zap, Globe, Database, Users, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => (
  <main className="home-container">
    {/* Hero Section */}
    <section className="hero">
      <h1>GeoAnalytics Pro</h1>
      <p>Piattaforma enterprise per analisi satellitari avanzate. Filtri spettrali, dati ambientali in tempo reale e dashboard professionali.</p>
      <div className="hero-actions">
        <Link to="/register" className="btn btn-primary">
          Inizia Gratis <ArrowRight size={16} />
        </Link>
        <Link to="#features" className="btn btn-outline">
          Scopri di Più
        </Link>
      </div>
      <div className="features-grid">
        <div className="feature-card glass">
          <Satellite size={24} className="text-accent" />
          <h3>Immagini Satellitari</h3>
          <p>Accesso a dati multi-spettrali da fonti NASA, ESA e Copernicus.</p>
        </div>
        <div className="feature-card glass">
          <BarChart3 size={24} className="text-accent" />
          <h3>Analytics Avanzati</h3>
          <p>Dashboard interattive con metriche ambientali e trend storici.</p>
        </div>
        <div className="feature-card glass">
          <Shield size={24} className="text-accent" />
          <h3>Sicurezza Enterprise</h3>
          <p>Autenticazione a due fattori, crittografia end-to-end e compliance GDPR.</p>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="features" className="section">
      <div className="section-header">
        <h2>Funzionalità Professionali</h2>
        <p>Strumenti progettati per team di ricerca, aziende agricole, utility e istituzioni pubbliche.</p>
      </div>
      <div className="features-grid">
        {[
          { icon: <Zap size={24} />, title: 'Filtri Spettrali GPU', desc: 'Applica filtri UV, IR e NDVI in tempo reale con accelerazione hardware.' },
          { icon: <Globe size={24} />, title: 'Copertura Globale', desc: 'Dati satellitari aggiornati per qualsiasi coordinata terrestre.' },
          { icon: <Database size={24} />, title: 'Export Multi-Formato', desc: 'Esporta risultati in CSV, GeoJSON, GeoTIFF o report PDF.' },
          { icon: <Users size={24} />, title: 'Collaborazione Team', desc: 'Condividi progetti, dashboard e report con il tuo team.' }
        ].map((f, i) => (
          <div key={i} className="feature-card glass glass-hover">
            <div className="text-accent mb-2">{f.icon}</div>
            <h3>{f.title}</h3>
            <p className="text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="section">
      <div className="section-header">
        <h2>Piani & Abbonamenti</h2>
        <p>Scegli il livello di accesso adatto alle tue esigenze. Tutti i piani includono aggiornamenti in tempo reale.</p>
      </div>
      <PricingSection />
    </section>

    {/* CTA Section */}
    <section className="section" style={{ textAlign: 'center', background: 'var(--bg-secondary)' }}>
      <div className="section-header">
        <h2>Pronto a Iniziare?</h2>
        <p>Unisciti a centinaia di aziende che già utilizzano GeoAnalytics Pro per decisioni basate sui dati.</p>
        <Link to="/register" className="btn btn-primary mt-4">
          Crea Account Gratuito <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </main>
);
