import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { LayerID, FilterMode } from '../../types';

const LAYERS: { id: LayerID; label: string; icon: string; color: string }[] = [
  { id: 'satellite', label: 'Satellite', icon: '🛰️', color: '#38bdf8' },
  { id: 'clouds', label: 'Nuvole', icon: '☁️', color: '#94a3b8' },
  { id: 'temp', label: 'Temperatura', icon: '🌡️', color: '#f97316' },
  { id: 'wind', label: 'Vento', icon: '💨', color: '#22d3ee' },
  { id: 'precip', label: 'Pioggia', icon: '🌧️', color: '#60a5fa' }
];

const FILTERS: { id: FilterMode; label: string; icon: string; color: string }[] = [
  { id: 'none', label: 'Originale', icon: '🔍', color: '#94a3b8' },
  { id: 'uv', label: 'UV', icon: '🔵', color: '#3b82f6' },
  { id: 'ir', label: 'IR', icon: '🔴', color: '#ef4444' },
  { id: 'ndvi', label: 'NDVI', icon: '🟢', color: '#22c55e' },
  { id: 'thermal', label: 'Termico', icon: '🟠', color: '#f97316' }
];

export const ControlPanel: React.FC = () => {
  const { activeLayer, setLayer, filterMode, setFilter, filterIntensity, setFilterIntensity, toggleUI, uiExpanded, timeOffset, setTimeOffset } = useAppStore();

  // Sincronizza il filtro con il layer attivo quando cambia il layer
  useEffect(() => {
    const layerToFilterMap: Record<string, FilterMode> = {
      satellite: 'none',
      clouds: 'uv',
      temp: 'thermal',
      wind: 'ndvi',
      precip: 'ir'
    };
    setFilter(layerToFilterMap[activeLayer] || 'none');
  }, [activeLayer, setFilter]);

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
            <button 
              key={l.id} 
              className={`chip ${activeLayer === l.id ? 'active' : ''}`} 
              onClick={() => setLayer(l.id)}
              style={{
                borderColor: activeLayer === l.id ? l.color : 'var(--border)',
                color: activeLayer === l.id ? l.color : 'var(--text-secondary)',
                background: activeLayer === l.id ? `${l.color}20` : 'var(--bg-tertiary)',
                boxShadow: activeLayer === l.id ? `0 0 8px ${l.color}40` : 'none'
              }}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label>Filtri Spettrali</label>
        <div className="grid">
          {FILTERS.map(f => (
            <button 
              key={f.id} 
              className={`chip ${filterMode === f.id ? 'active' : ''}`} 
              onClick={() => setFilter(f.id)}
              style={{
                borderColor: filterMode === f.id ? f.color : 'var(--border)',
                color: filterMode === f.id ? f.color : 'var(--text-secondary)',
                background: filterMode === f.id ? `${f.color}20` : 'var(--bg-tertiary)',
                boxShadow: filterMode === f.id ? `0 0 8px ${f.color}40` : 'none'
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className="slider-group">
          <span>Intensità: {(filterIntensity * 100).toFixed(0)}%</span>
          <input type="range" min="0" max="1" step="0.05" value={filterIntensity} onChange={e => setFilterIntensity(parseFloat(e.target.value))} />
        </div>
      </div>

      <div className="section">
        <label>Timeline (-7 giorni)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '80px' }}>
            {timeOffset === 0 ? 'Oggi' : `${Math.abs(timeOffset)}g fa`}
          </span>
          <input 
            type="range" 
            min="-7" 
            max="0" 
            step="1" 
            value={timeOffset} 
            onChange={e => setTimeOffset(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {[-7, -5, -3, -1, 0].map(t => (
            <span 
              key={t} 
              onClick={() => setTimeOffset(t)}
              style={{ 
                cursor: 'pointer', 
                color: timeOffset === t ? 'var(--text-accent)' : 'inherit',
                fontWeight: timeOffset === t ? 600 : 400
              }}
            >
              {t === 0 ? 'Oggi' : `${Math.abs(t)}g`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
