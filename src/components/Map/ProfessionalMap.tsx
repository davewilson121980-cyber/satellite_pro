import React, { useCallback, useMemo, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import { useAppStore } from '../../store/useAppStore';
import { getTileSource } from '../../api/dataService';
import type { FilterMode } from '../../types';
import 'maplibre-gl/dist/maplibre-gl.css';

const FILTER_STYLES: Record<string, any> = {
  none: { 'raster-brightness-min': 0, 'raster-brightness-max': 1, 'raster-hue-rotate': 0 },
  uv:   { 'raster-brightness-min': 0.1, 'raster-brightness-max': 0.9, 'raster-hue-rotate': 180, 'raster-opacity': 0.9 },
  ir:   { 'raster-brightness-min': 0.2, 'raster-brightness-max': 1.1, 'raster-hue-rotate': 0, 'raster-opacity': 0.85 },
  ndvi: { 'raster-brightness-min': 0, 'raster-brightness-max': 1.2, 'raster-hue-rotate': 90, 'raster-opacity': 0.95 },
  thermal: { 'raster-brightness-min': 0.3, 'raster-brightness-max': 1, 'raster-hue-rotate': -30, 'raster-opacity': 0.8 }
};

const LAYER_COLORS: Record<string, string> = {
  none: '#94a3b8',
  uv: '#3b82f6',
  ir: '#ef4444',
  ndvi: '#22c55e',
  thermal: '#f97316'
};

export const ProfessionalMap: React.FC = () => {
  const { center, zoom, setCenter, setZoom, activeLayer, filterIntensity, timeOffset } = useAppStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const tileUrl = getTileSource(activeLayer);
  
  // Mappa i layer ai filtri corrispondenti
  const layerToFilterMap: Record<string, FilterMode> = {
    satellite: 'none',
    clouds: 'uv',
    temp: 'thermal',
    wind: 'ndvi',
    precip: 'ir'
  };
  
  // Determina il filtro corrente basato sul layer attivo e timeOffset
  const currentFilter = useMemo(() => {
    const baseFilter = layerToFilterMap[activeLayer] || 'none';
    const filters: FilterMode[] = ['none', 'uv', 'ir', 'ndvi', 'thermal'];
    const baseIndex = filters.indexOf(baseFilter);
    const offsetIndex = Math.abs(timeOffset) % filters.length;
    return filters[(baseIndex + offsetIndex) % filters.length];
  }, [activeLayer, timeOffset]);
  
  const paintProps = useMemo(() => {
    const baseStyle = FILTER_STYLES[currentFilter] || FILTER_STYLES.none;
    return {
      ...baseStyle,
      'raster-opacity': (baseStyle['raster-opacity'] || 0.85) + filterIntensity * 0.15
    };
  }, [currentFilter, filterIntensity]);
  
  const style = useMemo(() => ({
    version: 8,
    sources: { 
      base: { 
        type: 'raster', 
        tiles: [tileUrl], 
        tileSize: 256,
        maxzoom: 19
      }
    },
    layers: [{ 
      id: 'layer', 
      type: 'raster', 
      source: 'base', 
      paint: paintProps
    }]
  }), [tileUrl, paintProps]);

  const handleMove = useCallback((evt: any) => {
    const lngLat = evt.target.getCenter();
    setCenter([lngLat.lat, lngLat.lng]);
    setZoom(Math.round(evt.target.getZoom()));
  }, [setCenter, setZoom]);

  return (
    <div className="map-wrapper">
      <Map
        mapLib={import('maplibre-gl')}
        initialViewState={{ longitude: center[1], latitude: center[0], zoom }}
        style={{ width: '100%', height: '100%' }}
        onMove={handleMove}
        mapStyle={style as any}
        attributionControl={false}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 8 }} />
        <div className="map-coords">
          🌍 {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E | 🔍 Zoom {zoom} | 🛰️ {activeLayer} | 🔍 Filtro: {currentFilter}
        </div>
        {!mapLoaded && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)' }}>
            ⏳ Caricamento mappa...
          </div>
        )}
      </Map>
      {/* Overlay indicator filtro attivo */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        left: '12px', 
        background: 'rgba(15, 23, 42, 0.95)', 
        padding: '0.5rem 0.75rem', 
        borderRadius: '6px', 
        fontSize: '0.75rem', 
        color: LAYER_COLORS[currentFilter],
        border: `1px solid ${LAYER_COLORS[currentFilter]}`,
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        🎨 Filtro: <strong>{currentFilter.toUpperCase()}</strong>
      </div>
    </div>
  );
};
