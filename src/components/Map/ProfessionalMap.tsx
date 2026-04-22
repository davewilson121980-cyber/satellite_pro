import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const ProfessionalMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Inizializza la mappa con limiti di zoom per evitare la ripetizione all'infinito
      mapRef.current = L.map('map-container', {
        center: [41.8719, 12.5674], // Roma come centro iniziale
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        worldCopyJump: true, // Salta tra le copie del mondo invece di ripeterle all'infinito
      });

      // Layer Satellitare (Base)
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
          noWrap: true, // Evita la ripetizione orizzontale delle tile
        }
      ).addTo(mapRef.current);

      // Layer Etichette (Città, Paesi, Strade) - Sovrapposto al satellitare
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
          noWrap: true,
        }
      ).addTo(mapRef.current);

      // Gestione ridimensionamento finestra
      window.addEventListener('resize', () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map-container" style={{ width: '100%', height: '100%', minHeight: '600px' }} />;
};
