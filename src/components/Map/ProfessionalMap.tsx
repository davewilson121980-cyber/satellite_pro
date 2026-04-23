import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTileSource } from '../../api/dataService';

interface ProfessionalMapProps {
  activeLayers: string[]; // Es: ['clouds', 'rain', 'temp']
  spectralFilter: string; // Es: 'ir', 'ndvi', 'thermal'
  timeIndex: number;
}

export const ProfessionalMap: React.FC<ProfessionalMapProps> = ({ 
  activeLayers, 
  spectralFilter,
  timeIndex 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.TileLayer }>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Inizializza la mappa
      mapRef.current = L.map('map-container', {
        center: [41.8719, 12.5674],
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        worldCopyJump: true,
      });

      // 1. Layer Satellitare (Base)
      const satelliteLayer = L.tileLayer(
        getTileSource('satellite'),
        { attribution: 'Tiles &copy; Esri', maxZoom: 19, noWrap: true }
      ).addTo(mapRef.current);
      layersRef.current['satellite'] = satelliteLayer;

      // 2. Layer Etichette (Città, Paesi) - Sovrapposto
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19, noWrap: true }
      ).addTo(mapRef.current);
      layersRef.current['labels'] = labelsLayer;

      // 3. Layer Meteo con URL reali da OpenWeatherMap
      const weatherLayersConfig: Record<string, { url: string; opacity: number }> = {
        clouds: { url: getTileSource('clouds'), opacity: 0 },
        rain: { url: getTileSource('precip'), opacity: 0 },
        temp: { url: getTileSource('temp'), opacity: 0 },
        wind: { url: getTileSource('wind'), opacity: 0 },
      };

      Object.entries(weatherLayersConfig).forEach(([layerName, config]) => {
        const layer = L.tileLayer(config.url, { 
          opacity: config.opacity, 
          noWrap: true,
          maxZoom: 19
        });
        layersRef.current[layerName] = layer;
      });

      window.addEventListener('resize', () => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });
    }

    return () => {
      // Cleanup opzionale se necessario ricreare la mappa
    };
  }, []);

  // Effetto per aggiornare la visibilità dei layer meteo e animazione basata su timeIndex
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.keys(layersRef.current).forEach(key => {
      const layer = layersRef.current[key];
      if (['clouds', 'rain', 'temp', 'wind'].includes(key)) {
        if (activeLayers.includes(key)) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
          }
          layer.setOpacity(0.7); // Opacità visibile
          
          // Aggiorna l'URL del layer per includere il timeIndex per l'animazione temporale
          // Nota: OpenWeatherMap non supporta nativamente il timeIndex, ma questa struttura
          // permette di integrare facilmente API che lo supportano in futuro
          // Per simulazione con dati mockati, si potrebbe usare:
          // const baseUrl = getTileSource(key as 'clouds' | 'precip' | 'temp' | 'wind');
          // layer.setUrl(`${baseUrl}&time=${timeIndex}`);
        } else {
          layer.setOpacity(0);
        }
      }
    });
  }, [activeLayers, timeIndex]);

  // Effetto per applicare filtri spettrali (simulati via CSS filter sul container della mappa)
  useEffect(() => {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      let filterStyle = 'none';
      switch (spectralFilter) {
        case 'ir': filterStyle = 'sepia(1) hue-rotate(-30deg) saturate(2)'; break; // Rosso
        case 'ndvi': filterStyle = 'hue-rotate(90deg) saturate(2)'; break; // Verde
        case 'thermal': filterStyle = 'contrast(1.2) brightness(1.1) hue-rotate(10deg)'; break; // Arancione/Caldo
        case 'uv': filterStyle = 'hue-rotate(180deg) saturate(1.5)'; break; // Blu
        default: filterStyle = 'none';
      }
      mapContainer.style.filter = filterStyle;
    }
  }, [spectralFilter]);

  return <div id="map-container" style={{ width: '100%', height: '100%', minHeight: '600px', zIndex: 1 }} />;
};