import React, { useState, useEffect } from 'react';
import { ProfessionalMap } from '../components/Map/ProfessionalMap';
import { ControlPanel } from '../components/UI/ControlPanel';
import { TimeSlider } from '../components/UI/TimeSlider';
import { AnalyticsPanel } from '../components/Dashboard/AnalyticsPanel';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Stato condiviso
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [spectralFilter, setSpectralFilter] = useState<string>('none');
  const [timeIndex, setTimeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Logica Timeline
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex(prev => (prev >= 23 ? 0 : prev + 1)); // Ciclo 24 ore
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handler per cambiare filtro quando cambia il tempo (opzionale, o manuale)
  useEffect(() => {
    // Esempio: cambio automatico filtro basato sull'ora simulata
    if (timeIndex >= 6 && timeIndex < 12) setSpectralFilter('ndvi');
    else if (timeIndex >= 12 && timeIndex < 18) setSpectralFilter('thermal');
    else setSpectralFilter('none');
  }, [timeIndex]);

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const setFilter = (filter: string) => {
    setSpectralFilter(filter);
    setIsPlaying(false); // Ferma timeline se cambio filtro manualmente
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dash-header glass">
        <h2>🛰️ Dashboard di Analisi</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="user-tag">Utente: {user?.name} | Piano: {user?.tier}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
      
      <div className="map-layout">
        {/* Passiamo lo stato alla mappa */}
        <ProfessionalMap 
          activeLayers={activeLayers} 
          spectralFilter={spectralFilter}
          timeIndex={timeIndex}
        />
        
        <aside className="side-panels">
          {/* Passiamo handler e stato ai controlli */}
          <ControlPanel 
            activeLayers={activeLayers}
            spectralFilter={spectralFilter}
            onToggleLayer={toggleLayer}
            onSetFilter={setFilter}
          />
          <AnalyticsPanel timeIndex={timeIndex} />
        </aside>
      </div>

      {/* Passiamo handler alla timeline */}
      <TimeSlider 
        currentIndex={timeIndex} 
        isPlaying={isPlaying} 
        onSlide={setTimeIndex} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
      />
    </div>
  );
};