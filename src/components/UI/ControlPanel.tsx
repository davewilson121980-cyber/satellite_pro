import React from 'react';

interface ControlPanelProps {
  activeLayers: string[];
  spectralFilter: string;
  onToggleLayer: (layer: string) => void;
  onSetFilter: (filter: string) => void;
  chartOpacity: number;
  filterMenuOpacity: number;
  onChartOpacityChange: (opacity: number) => void;
  onFilterMenuOpacityChange: (opacity: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeLayers,
  spectralFilter,
  onToggleLayer,
  onSetFilter,
  chartOpacity,
  filterMenuOpacity,
  onChartOpacityChange,
  onFilterMenuOpacityChange
}) => {
  const layers = [
    { id: 'clouds', label: 'Nuvole', color: '#3b82f6' }, // Blu
    { id: 'rain', label: 'Pioggia', color: '#ef4444' },   // Rosso
    { id: 'temp', label: 'Temperatura', color: '#f97316' }, // Arancione
    { id: 'wind', label: 'Vento', color: '#06b6d4' },     // Ciano
    { id: 'ndvi', label: 'NDVI', color: '#22c55e' },      // Verde
  ];

  const filters = [
    { id: 'none', label: 'Normale', color: '#6b7280' },
    { id: 'ir', label: 'Infrarosso', color: '#ef4444' },
    { id: 'ndvi', label: 'Vegetazione', color: '#22c55e' },
    { id: 'thermal', label: 'Termico', color: '#f97316' },
    { id: 'uv', label: 'UV', color: '#3b82f6' },
  ];

  return (
    <div 
      className="control-panel glass p-4 rounded-lg mb-4 overflow-y-auto max-h-[40vh]"
      style={{ 
        background: `rgba(30, 41, 59, ${filterMenuOpacity * 0.85})`,
        backdropFilter: 'blur(12px)',
        transition: 'background 0.2s ease'
      }}
    >
      <h3 className="text-lg font-bold mb-3 text-white">Layer Meteo</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => onToggleLayer(layer.id)}
            className={`p-2 rounded text-sm font-semibold transition-all ${
              activeLayers.includes(layer.id)
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={{ borderLeft: `4px solid ${layer.color}` }}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Slider Opacità Menu Filtri */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
          Opacità Menu Filtri: {(filterMenuOpacity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.3"
          max="1"
          step="0.05"
          value={filterMenuOpacity}
          onChange={(e) => onFilterMenuOpacityChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filterMenuOpacity - 0.3) / 0.7 * 100}%, #374151 ${(filterMenuOpacity - 0.3) / 0.7 * 100}%, #374151 100%)`
          }}
        />
      </div>

      {/* Slider Opacità Grafici */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
          Opacità Grafici: {(chartOpacity * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={chartOpacity}
          onChange={(e) => onChartOpacityChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${chartOpacity * 100}%, #374151 ${chartOpacity * 100}%, #374151 100%)`
          }}
        />
      </div>

      <div className="mb-4 w-fit">
        <h3 className="codepen-button font-bold uppercase tracking-wider text-sm">
          <span>Filtri Spettrali</span>
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onSetFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              spectralFilter === f.id
                ? 'bg-white text-black shadow-md scale-110'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            style={{ borderColor: f.color, borderWidth: spectralFilter === f.id ? '2px' : '1px' }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};