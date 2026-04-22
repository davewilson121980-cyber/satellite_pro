import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri', maxZoom: 19, noWrap: true }
      ).addTo(mapRef.current);
      layersRef.current['satellite'] = satelliteLayer;

      // 2. Layer Etichette (Città, Paesi) - Sovrapposto
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19, noWrap: true }
      ).addTo(mapRef.current);
      layersRef.current['labels'] = labelsLayer;

      // 3. Layer Meteo (Inizializzati vuoti o con URL demo se disponibili)
      // Nota: Per dati reali servono API Key. Qui usiamo placeholder logici.
      const weatherLayers = ['clouds', 'rain', 'temp', 'wind'];
      weatherLayers.forEach(layerName => {
        const layer = L.tileLayer('', { opacity: 0, noWrap: true });
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

  // Effetto per aggiornare la visibilità dei layer meteo
  useEffect(() => {
    if (!mapRef.current) return;

    Object.keys(layersRef.current).forEach(key => {
      const layer = layersRef.current[key];
      if (['clouds', 'rain', 'temp', 'wind'].includes(key)) {
        if (activeLayers.includes(key)) {
          if (!mapRef.current?.hasLayer(layer)) {
            layer.addTo(mapRef.current);
          }
          layer.setOpacity(0.7); // Opacità visibile
          
          // Simulazione URL dinamico (da sostituire con API reale)
          // Esempio: layer.setUrl(`.../layer/${key}/time/${timeIndex}.png`)
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