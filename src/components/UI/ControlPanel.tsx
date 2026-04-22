import React from 'react';
import { Cloud, Droplets, Thermometer, Wind, Sun, Eye, Leaf, Zap, Filter } from 'lucide-react';

interface ControlPanelProps {
  activeLayers: string[];
  toggleLayer: (layer: string) => void;
  activeFilter: string;
  setFilter: (filter: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeLayers,
  toggleLayer,
  activeFilter,
  setFilter,
}) => {
  
  // Configurazione stilistica per i layer Meteo
  const weatherLayers = [
    { id: 'clouds', label: 'Nuvole', icon: Cloud, color: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/50' },
    { id: 'rain', label: 'Pioggia', icon: Droplets, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/50' },
    { id: 'temp', label: 'Temperatura', icon: Thermometer, color: 'from-orange-400 to-red-600', shadow: 'shadow-red-500/50' },
    { id: 'wind', label: 'Vento', icon: Wind, color: 'from-teal-400 to-emerald-600', shadow: 'shadow-emerald-500/50' },
  ];

  // Configurazione stilistica per i Filtri Spettrali
  const spectralFilters = [
    { id: 'normal', label: 'Normale', icon: Eye, color: 'from-gray-500 to-gray-700', border: 'border-gray-400' },
    { id: 'ir', label: 'Infrarosso', icon: Sun, color: 'from-red-500 to-red-800', border: 'border-red-500' },
    { id: 'ndvi', label: 'Vegetazione', icon: Leaf, color: 'from-green-500 to-green-800', border: 'border-green-500' },
    { id: 'thermal', label: 'Termico', icon: Thermometer, color: 'from-amber-500 to-orange-700', border: 'border-amber-500' },
    { id: 'uv', label: 'UV', icon: Zap, color: 'from-indigo-500 to-violet-800', border: 'border-indigo-500' },
  ];

  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col gap-8 overflow-y-auto max-h-[80vh]">
      
      {/* Sezione Layer Meteo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-cyan-300 border-b border-cyan-900/50 pb-2">
          <Cloud className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-sm">Layer Meteo</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {weatherLayers.map((layer) => {
            const isActive = activeLayers.includes(layer.id);
            const Icon = layer.icon;
            
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`
                  relative overflow-hidden group p-3 rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-2
                  ${isActive 
                    ? `bg-gradient-to-br ${layer.color} text-white shadow-lg ${layer.shadow} scale-105 ring-2 ring-white/30` 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'}
                `}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-xs font-semibold">{layer.label}</span>
                
                {/* Indicatore attivo */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sezione Filtri Spettrali */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-purple-300 border-b border-purple-900/50 pb-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-sm">Filtri Spettrali</h3>
        </div>

        <div className="flex flex-col gap-2">
          {spectralFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                onClick={() => setFilter(filter.id)}
                className={`
                  relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 border
                  ${isActive 
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg ${filter.border} ring-1 ring-white/40 translate-x-1` 
                    : 'bg-slate-800/30 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'}
                `}
              >
                <div className={`p-2 rounded-md ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm flex-1 text-left">{filter.label}</span>
                
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
