import React, { useState, useEffect } from 'react';
import { ProfessionalMap } from '../components/Map/ProfessionalMap';
import { ControlPanel } from '../components/UI/ControlPanel';
import { TimeSlider } from '../components/UI/TimeSlider';
import { AnalyticsPanel } from '../components/Dashboard/AnalyticsPanel';
import { useAuthStore } from '../store/useAuthStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Stato condiviso
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [spectralFilter, setSpectralFilter] = useState<string>('none');
  const [timeIndex, setTimeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Logica Timeline
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
        <span className="user-tag">Utente: {user?.name} | Piano: {user?.tier}</span>
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