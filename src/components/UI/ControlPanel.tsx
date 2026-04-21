import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { LayerID, FilterMode } from '../../types';

const LAYERS: { id: LayerID; label: string; icon: string }[] = [
  { id: 'satellite', label: 'Satellite', icon: '🛰️' },
  { id: 'clouds', label: 'Nuvole', icon: '☁️' },
  { id: 'temp', label: 'Temperatura', icon: '🌡️' },
  { id: 'wind', label: 'Vento', icon: '💨' },
  { id: 'precip', label: 'Pioggia', icon: '🌧️' }
];

const FILTERS: { id: FilterMode; label: string; icon: string }[] = [
  { id: 'none', label: 'Originale', icon: '🔍' },
  { id: 'uv', label: 'UV', icon: '🔵' },
  { id: 'ir', label: 'IR', icon: '🔴' },
  { id: 'ndvi', label: 'NDVI', icon: '🟢' },
  { id: 'thermal', label: 'Termico', icon: '🟠' }
];

export const ControlPanel: React.FC = () => {
  const { activeLayer, setLayer, filterMode, setFilter, filterIntensity, setFilterIntensity, toggleUI, uiExpanded } = useAppStore();

  if (!uiExpanded) {
    return (
      <div className="panel collapsed">
        <button className="toggle-btn" onClick={toggleUI}>▶️</button>
      </div>
    );
  }

  return (
    <div className="panel expanded">
      <button className="toggle-btn" onClick={toggleUI}>◀️</button>
      <h3>🎛️ Controlli</h3>
      
      <div className="section">
        <label>Layer</label>
        <div className="grid">
          {LAYERS.map(l => (
            <button key={l.id} className={`chip ${activeLayer === l.id ? 'active' : ''}`} onClick={() => setLayer(l.id)}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label>Filtri Spettrali</label>
        <div className="grid">
          {FILTERS.map(f => (
            <button key={f.id} className={`chip ${filterMode === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className="slider-group">
          <span>Intensità: {(filterIntensity * 100).toFixed(0)}%</span>
          <input type="range" min="0" max="1" step="0.05" value={filterIntensity} onChange={e => setFilterIntensity(parseFloat(e.target.value))} />
        </div>
      </div>
    </div>
  );
};
