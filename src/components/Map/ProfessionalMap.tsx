import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const ProfessionalMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Inizializza la mappa
      mapRef.current = L.map('map-container', {
        center: [41.8719, 12.5674], // Roma come centro iniziale
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        worldCopyJump: true, // Previene la ripetizione infinita orizzontale
      });

      // 1. Layer Satellitare (Base)
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
          noWrap: true, 
        }
      );

      // 2. Layer Etichette (Città, Paesi) - Sovrapposto
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
          noWrap: true,
        }
      );

      // Aggiunta esplicita dei layer alla mappa per evitare warning TS
      satelliteLayer.addTo(mapRef.current);
      labelsLayer.addTo(mapRef.current);

      // Gestione ridimensionamento finestra
      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  return <div id="map-container" style={{ width: '100%', height: '100%', minHeight: '600px' }} />;
};