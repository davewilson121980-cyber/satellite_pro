import React, { useState, useCallback } from 'react';
import { ProfessionalMap } from '../components/Map/ProfessionalMap';
import { ControlPanel } from '../components/UI/ControlPanel';
import { TimeSlider } from '../components/UI/TimeSlider';
import { AnalyticsPanel } from '../components/Dashboard/AnalyticsPanel';
import { useAuthStore } from '../store/useAuthStore';

// Definizione dei tipi per i layer disponibili
export type LayerType = 'clouds' | 'rain' | 'wind' | 'temp' | 'pressure';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  // Stato per gestire quali layer meteo sono attivi
  const [activeLayers, setActiveLayers] = useState<LayerType[]>([]);
  
  // Stato per la timeline (usato per sincronizzare animazioni e filtri)
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Funzione per attivare/disattivare un layer
  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer) 
        : [...prev, layer]
    );
  }, []);

  // Funzione per impostare un layer specifico (usato dalla timeline)
  const setLayer = useCallback((layer: LayerType | null) => {
    if (!layer) {
      setActiveLayers([]);
    } else {
      setActiveLayers([layer]);
    }
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dash-header glass">
        <h2>🛰️ Dashboard di Analisi</h2>
        <span className="user-tag">Utente: {user?.name} | Piano: {user?.tier}</span>
      </div>
      
      <div className="map-layout">
        {/* Passiamo activeLayers e le funzioni di controllo alla mappa */}
        <ProfessionalMap 
          activeLayers={activeLayers}
          onLayerChange={setLayer}
        />
        
        <aside className="side-panels">
          {/* Passiamo lo stato e le funzioni al pannello di controllo */}
          <ControlPanel 
            activeLayers={activeLayers}
            onToggleLayer={toggleLayer}
          />
          <AnalyticsPanel />
        </aside>
      </div>

      {/* Passiamo le funzioni di controllo tempo e layer al time slider */}
      <TimeSlider 
        currentTime={currentTime}
        isPlaying={isPlaying}
        onTimeChange={setCurrentTime}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onLayerChange={setLayer}
      />
    </div>
  );
};