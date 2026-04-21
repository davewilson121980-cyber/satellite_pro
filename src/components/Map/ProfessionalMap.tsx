import React, { useCallback, useMemo, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import { useAppStore } from '../../store/useAppStore';
import { getTileSource } from '../../api/dataService';
import 'maplibre-gl/dist/maplibre-gl.css';

const FILTER_STYLES: Record<string, any> = {
  none: { 'raster-brightness-min': 0, 'raster-brightness-max': 1, 'raster-hue-rotate': 0 },
  uv:   { 'raster-brightness-min': 0.1, 'raster-brightness-max': 0.9, 'raster-hue-rotate': 180 },
  ir:   { 'raster-brightness-min': 0.2, 'raster-brightness-max': 1.1, 'raster-hue-rotate': 0 },
  ndvi: { 'raster-brightness-min': 0, 'raster-brightness-max': 1.2, 'raster-hue-rotate': 90 },
  thermal: { 'raster-brightness-min': 0.3, 'raster-brightness-max': 1, 'raster-hue-rotate': -30 }
};

export const ProfessionalMap: React.FC = () => {
  const { center, zoom, setCenter, setZoom, activeLayer, filterMode, filterIntensity } = useAppStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const tileUrl = getTileSource(activeLayer);
  
  const paintProps = useMemo(() => FILTER_STYLES[filterMode] || FILTER_STYLES.none, [filterMode]);
  
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
      paint: { 
        ...paintProps, 
        'raster-opacity': 0.85 + filterIntensity * 0.15 
      } 
    }]
  }), [tileUrl, paintProps, filterIntensity]);

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
          🌍 {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E | 🔍 Zoom {zoom} | 🛰️ {activeLayer}
        </div>
        {!mapLoaded && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)' }}>
            ⏳ Caricamento mappa...
          </div>
        )}
      </Map>
    </div>
  );
};
