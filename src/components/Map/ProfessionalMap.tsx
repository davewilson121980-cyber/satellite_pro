import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTileSource } from '../../api/dataService';

interface ProfessionalMapProps {
  activeLayers: string[]; // Es: ['clouds', 'rain', 'temp']
  spectralFilter: string; // Es: 'ir', 'ndvi', 'thermal'
  timeIndex: number;
  chartOpacity?: number;
  filterMenuOpacity?: number;
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
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      });

      // 1. Layer Satellitare Esri World Imagery (Base) - Foto ad alta risoluzione
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { 
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19, 
          noWrap: true,
          subdomains: 'abcd'
        }
      ).addTo(mapRef.current);
      layersRef.current['satellite'] = satelliteLayer;

      // 2. Layer Etichette Esri World Boundaries and Places - Nomi luoghi geografici
      const labelsLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { 
          attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          subdomains: 'abcd', 
          maxZoom: 19, 
          noWrap: true,
          opacity: 0.8
        }
      ).addTo(mapRef.current);
      layersRef.current['labels'] = labelsLayer;

      // 3. Layer Meteo con overlay colorati
      const weatherLayersConfig: Record<string, { url: string; opacity: number; color: string }> = {
        clouds: { url: getTileSource('clouds'), opacity: 0, color: '#3b82f6' }, // Blu
        rain: { url: getTileSource('precip'), opacity: 0, color: '#ef4444' },   // Rosso
        temp: { url: getTileSource('temp'), opacity: 0, color: '#f97316' },     // Arancione zone calde
        wind: { url: getTileSource('wind'), opacity: 0, color: '#06b6d4' },     // Ciano
      };

      Object.entries(weatherLayersConfig).forEach(([layerName, config]) => {
        const layer = L.tileLayer(config.url, { 
          opacity: config.opacity, 
          noWrap: true,
          maxZoom: 19
        });
        
        // Aggiungi popup informativo
        layer.on('click', (e) => {
          const popupContent = `
            <div style="font-family: 'Inter', sans-serif; font-size: 14px;">
              <h4 style="margin: 0 0 8px 0; color: ${config.color};">${layerName.toUpperCase()}</h4>
              <p style="margin: 0; color: #64748b;">Dati meteo in tempo reale</p>
            </div>
          `;
          L.popup({ maxWidth: 250 })
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(mapRef.current!);
        });
        
        layersRef.current[layerName] = layer;
      });

      // 4. Layer NDVI con aloni verdi
      const ndviLayer = L.tileLayer(
        getTileSource('ndvi'),
        { opacity: 0, noWrap: true, maxZoom: 19 }
      );
      
      ndviLayer.on('click', (e) => {
        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; font-size: 14px;">
            <h4 style="margin: 0 0 8px 0; color: #22c55e;">NDVI</h4>
            <p style="margin: 0; color: #64748b;">Indice di vegetazione - Alone verde</p>
          </div>
        `;
        L.popup({ maxWidth: 250 })
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(mapRef.current!);
      });
      layersRef.current['ndvi'] = ndviLayer;

      // 5. Layer Solar (Infrared e UV)
      const solarLayersConfig: Record<string, { url: string; opacity: number; color: string }> = {
        ir: { url: getTileSource('infrared'), opacity: 0, color: '#ef4444' }, // Rosso per infrared
        uv: { url: getTileSource('uv'), opacity: 0, color: '#3b82f6' },        // Blu per uv
      };

      Object.entries(solarLayersConfig).forEach(([layerName, config]) => {
        const layer = L.tileLayer(config.url, { 
          opacity: config.opacity, 
          noWrap: true,
          maxZoom: 19
        });
        
        layer.on('click', (e) => {
          const popupContent = `
            <div style="font-family: 'Inter', sans-serif; font-size: 14px;">
              <h4 style="margin: 0 0 8px 0; color: ${config.color};">${layerName === 'ir' ? 'INFRAROSSO' : 'UV'}</h4>
              <p style="margin: 0; color: #64748b;">Dati solari - ${layerName === 'ir' ? 'Rosso' : 'Blu'}</p>
            </div>
          `;
          L.popup({ maxWidth: 250 })
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(mapRef.current!);
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
      
      // Gestione layer meteo (clouds, rain, temp, wind)
      if (['clouds', 'rain', 'temp', 'wind'].includes(key)) {
        if (activeLayers.includes(key)) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
          }
          layer.setOpacity(0.7); // Opacità visibile
        } else {
          layer.setOpacity(0);
        }
      }
      
      // Gestione layer NDVI
      if (key === 'ndvi') {
        if (spectralFilter === 'ndvi' || activeLayers.includes('ndvi')) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
          }
          layer.setOpacity(0.6); // Alone verde semi-trasparente
        } else {
          layer.setOpacity(0);
        }
      }
      
      // Gestione layer Solar (infrared e uv)
      if (['ir', 'uv'].includes(key)) {
        if (spectralFilter === key) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
          }
          layer.setOpacity(0.7);
        } else {
          layer.setOpacity(0);
        }
      }
    });
  }, [activeLayers, spectralFilter, timeIndex]);

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