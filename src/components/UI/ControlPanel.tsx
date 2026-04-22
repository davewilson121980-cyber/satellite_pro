import React from 'react';

interface ControlPanelProps {
  activeLayers: string[];
  spectralFilter: string;
  onToggleLayer: (layer: string) => void;
  onSetFilter: (filter: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeLayers,
  spectralFilter,
  onToggleLayer,
  onSetFilter
}) => {
  const layers = [
    { id: 'clouds', label: 'Nuvole', color: '#3b82f6' }, // Blu
    { id: 'rain', label: 'Pioggia', color: '#ef4444' },   // Rosso
    { id: 'temp', label: 'Temperatura', color: '#f97316' }, // Arancione
    { id: 'wind', label: 'Vento', color: '#22c55e' },     // Verde
  ];

  const filters = [
    { id: 'none', label: 'Normale', color: '#6b7280' },
    { id: 'ir', label: 'Infrarosso', color: '#ef4444' },
    { id: 'ndvi', label: 'Vegetazione', color: '#22c55e' },
    { id: 'thermal', label: 'Termico', color: '#f97316' },
    { id: 'uv', label: 'UV', color: '#3b82f6' },
  ];

  return (
    <div className="control-panel glass p-4 rounded-lg mb-4 overflow-y-auto max-h-[40vh]">
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

      <h3 className="text-lg font-bold mb-3 text-white">Filtri Spettrali</h3>
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