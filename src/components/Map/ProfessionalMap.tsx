import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Definiamo un'interfaccia per esporre i metodi della mappa al genitore
export interface MapInstance {
  toggleLayer: (layerName: string, visible: boolean) => void;
  setLayerOpacity: (layerName: string, opacity: number) => void;
}

interface ProfessionalMapProps {
  onMapReady?: (instance: MapInstance) => void;
  activeLayers?: string[]; // Es: ['clouds', 'rain', 'temp']
}

export const ProfessionalMap: React.FC<ProfessionalMapProps> = ({ 
  onMapReady, 
  activeLayers = [] 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.TileLayer>>({});

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
        {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
          noWrap: true,
        }
      ).addTo(mapRef.current);

      // 2. Layer Etichette (Città, Paesi)
      const labelsLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
          noWrap: true,
          zIndex: 10, // Assicura che stia sopra il satellitare
        }
      ).addTo(mapRef.current);

      // 3. Layer Meteo (Nuvole, Pioggia, Temp, Vento)
      // Nota: Usiamo URL generici OpenWeatherMap come esempio. 
      // Sostituisci 'YOUR_API_KEY' con una chiave reale se necessario, o usa layer mockati.
      // Per demo, usiamo layer semitrasparenti colorati se l'API non è disponibile, 
      // ma qui impostiamo la struttura corretta per tile layer reali.
      
      const cloudLayer = L.tileLayer('', { opacity: 0 }).addTo(mapRef.current); // Placeholder
      const rainLayer = L.tileLayer('', { opacity: 0 }).addTo(mapRef.current);
      const tempLayer = L.tileLayer('', { opacity: 0 }).addTo(mapRef.current);
      const windLayer = L.tileLayer('', { opacity: 0 }).addTo(mapRef.current);

      // Salviamo i riferimenti
      layersRef.current = {
        clouds: cloudLayer,
        rain: rainLayer,
        temp: tempLayer,
        wind: windLayer,
      };

      // Funzione per aggiornare i layer basandosi sulle props
      const updateLayers = () => {
        Object.keys(layersRef.current).forEach(key => {
          const layer = layersRef.current[key];
          const isActive = activeLayers.includes(key);
          
          if (isActive) {
            // Se attivo, impostiamo l'URL reale (simulato qui per demo)
            // In produzione, qui metteresti l'URL vero di OpenWeatherMap o simile
            let url = '';
            if (key === 'clouds') url = 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY';
            if (key === 'rain') url = 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY';
            if (key === 'temp') url = 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY';
            if (key === 'wind') url = 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY';
            
            // Se non hai API KEY, usiamo un colore solido per testare la logica di toggle
            if (!url.includes('YOUR_API_KEY')) {
               layer.setUrl(url);
            } else {
               // Fallback visivo per test senza API key (rimuovi in produzione)
               // Creiamo un div icon per simulare la presenza del layer
               console.log(`Layer ${key} attivato (necessaria API Key per dati reali)`);
               layer.setOpacity(0.6); 
               // Per demo pura senza API, potremmo usare un layer finto colorato
               // Ma manteniamo la struttura pronta per l'API
            }
            layer.setOpacity(0.7); // Opacità default quando attivo
          } else {
            layer.setOpacity(0);
          }
        });
      };

      // Eseguiamo il primo aggiornamento
      updateLayers();

      // Esponiamo l'istanza al genitore
      if (onMapReady) {
        onMapReady({
          toggleLayer: (layerName: string, visible: boolean) => {
            const layer = layersRef.current[layerName];
            if (layer) {
              if (visible) {
                // Logica per attivare (qui semplificata, in realtà dovresti passare l'URL)
                layer.setOpacity(0.7);
              } else {
                layer.setOpacity(0);
              }
            }
          },
          setLayerOpacity: (layerName: string, opacity: number) => {
            const layer = layersRef.current[layerName];
            if (layer) layer.setOpacity(opacity);
          }
        });
      }

      window.addEventListener('resize', () => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });
    } else {
      // Se la mappa esiste già, aggiorniamo solo i layer quando cambiano le props
      Object.keys(layersRef.current).forEach(key => {
        const layer = layersRef.current[key];
        const isActive = activeLayers.includes(key);
        layer.setOpacity(isActive ? 0.7 : 0);
      });
    }
  }, [activeLayers, onMapReady]);

  return <div id="map-container" style={{ width: '100%', height: '100%', minHeight: '600px', zIndex: 1 }} />;
};