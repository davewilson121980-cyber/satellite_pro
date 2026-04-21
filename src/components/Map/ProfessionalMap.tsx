import React, { useCallback, useMemo } from 'react';
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
  const tileUrl = getTileSource(activeLayer);
  const paintProps = FILTER_STYLES[filterMode] || FILTER_STYLES.none;

  const handleMove = useCallback((evt: any) => {
    setCenter([evt.target.getCenter().lat, evt.target.getCenter().lng]);
    setZoom(Math.round(evt.target.getZoom()));
  }, [setCenter, setZoom]);

  const style = useMemo(() => ({
    version: 8,
    sources: { base: { type: 'raster', tiles: [tileUrl], tileSize: 256 } },
    layers: [{ id: 'layer', type: 'raster', source: 'base', paint: { ...paintProps, 'raster-opacity': 0.85 + filterIntensity * 0.15 } }]
  }), [tileUrl, paintProps, filterIntensity]);

  return (
    <div className="map-wrapper">
      <Map
        mapLib={import('maplibre-gl')}
        initialViewState={{ longitude: center[1], latitude: center[0], zoom }}
        style={{ width: '100%', height: '100%' }}
        onMove={handleMove}
        mapStyle={style as any}
        attributionControl={false}
      >
        <NavigationControl position="top-right" style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 8 }} />
        <div className="map-coords">🌍 {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E | 🔍 Zoom {zoom}</div>
      </Map>
    </div>
  );
};
