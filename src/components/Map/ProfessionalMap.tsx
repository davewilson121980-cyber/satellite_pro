import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTileSource } from '../../api/dataService';
import { useAppStore } from '../../store/useAppStore';
import type { CityLabel } from '../../types';

interface ProfessionalMapProps {
  activeLayers: string[]; // Es: ['clouds', 'rain', 'temp']
  spectralFilter: string; // Es: 'ir', 'ndvi', 'thermal'
  timeIndex: number;
  chartOpacity?: number;
  filterMenuOpacity?: number;
}

// Dati simulati per le città con temperature (ispirato a Zoom Earth)
const cityLabels: CityLabel[] = [
  { name: 'Roma', lat: 41.9028, lng: 12.4964, temp: 22 },
  { name: 'Milano', lat: 45.4642, lng: 9.1900, temp: 18 },
  { name: 'Napoli', lat: 40.8518, lng: 14.2681, temp: 24 },
  { name: 'Torino', lat: 45.0703, lng: 7.6869, temp: 17 },
  { name: 'Palermo', lat: 38.1157, lng: 13.3615, temp: 26 },
  { name: 'Genova', lat: 44.4056, lng: 8.9463, temp: 20 },
  { name: 'Bologna', lat: 44.4949, lng: 11.3426, temp: 19 },
  { name: 'Firenze', lat: 43.7696, lng: 11.2558, temp: 21 },
  { name: 'Bari', lat: 41.1171, lng: 16.8719, temp: 23 },
  { name: 'Catania', lat: 37.5079, lng: 15.0830, temp: 25 },
  { name: 'Venezia', lat: 45.4408, lng: 12.3155, temp: 18 },
  { name: 'Verona', lat: 45.4384, lng: 10.9916, temp: 19 },
];

export const ProfessionalMap: React.FC<ProfessionalMapProps> = ({ 
  activeLayers, 
  spectralFilter,
  timeIndex
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const markersRef = useRef<L.Marker[]>([]);
  const popupOverlayRef = useRef<HTMLDivElement | null>(null);
  const [popupInfo, setPopupInfo] = useState<{ lat: number; lng: number; location: string; dataType: string; color: string } | null>(null);
  
  // Usa lo store globale per coordinate, modello meteo e radar
  const { coordinates, setCoordinates, weatherModel, setWeatherModel, radarState, setRadarState } = useAppStore();
  const [scaleDistance, setScaleDistance] = useState<string>('');
  const [showModelPanel, setShowModelPanel] = useState(false);

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
        
        // Aggiungi popup informativo con nome località e tipo dato
        layer.on('click', (e) => {
          const locationName = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
          setPopupInfo({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            location: locationName,
            dataType: layerName.toUpperCase(),
            color: config.color
          });
        });
        
        layersRef.current[layerName] = layer;
      });

      // 4. Layer NDVI con aloni verdi
      const ndviLayer = L.tileLayer(
        getTileSource('ndvi'),
        { opacity: 0, noWrap: true, maxZoom: 19 }
      );
      
      ndviLayer.on('click', (e) => {
        const locationName = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
        setPopupInfo({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          location: locationName,
          dataType: 'NDVI',
          color: '#22c55e'
        });
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
          const locationName = `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
          setPopupInfo({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            location: locationName,
            dataType: layerName === 'ir' ? 'INFRAROSSO' : 'UV',
            color: config.color
          });
        });
        
        layersRef.current[layerName] = layer;
      });

      // Aggiungi etichette città con temperature (ispirato a Zoom Earth)
      cityLabels.forEach(city => {
        const tempColor = getTemperatureColor(city.temp);
        const cityIcon = L.divIcon({
          className: 'city-label-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              transform: translate(-50%, -100%);
            ">
              <div style="
                background-color: ${tempColor};
                color: #000;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${city.temp}°</div>
              <span style="
                background: rgba(0,0,0,0.7);
                color: #fff;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                white-space: nowrap;
              ">${city.name}</span>
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15]
        });
        
        const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
          .addTo(mapRef.current!);
        
        marker.bindTooltip(city.name, {
          permanent: false,
          direction: 'top',
          className: 'city-tooltip'
        });
        
        markersRef.current.push(marker);
      });

      // Event listener per aggiornare coordinate e scala
      mapRef.current.on('mousemove', (e) => {
        setCoordinates({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      });

      mapRef.current.on('zoomend', () => {
        updateScaleDisplay();
      });

      window.addEventListener('resize', () => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });

      // Inizializza scala
      updateScaleDisplay();
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, []);

  // Funzione per ottenere colore basato sulla temperatura (ispirato a Zoom Earth)
  const getTemperatureColor = (temp: number): string => {
    if (temp <= 0) return '#a5f3fc';     // Molto freddo - ciano chiaro
    if (temp <= 10) return '#67e8f9';    // Freddo - ciano
    if (temp <= 15) return '#22d3ee';    // Fresco - ciano scuro
    if (temp <= 20) return '#fef08a';    // Mite - giallo chiaro
    if (temp <= 25) return '#fde047';    // Caldo - giallo
    if (temp <= 30) return '#facc15';    // Molto caldo - giallo scuro
    if (temp <= 35) return '#fb923c';    // Torrido - arancione
    return '#f87171';                     // Estremo - rosso
  };

  // Aggiorna display della scala
  const updateScaleDisplay = () => {
    if (!mapRef.current) return;
    
    const center = mapRef.current.getCenter();
    const containerWidth = mapRef.current.getSize().x;
    
    // Calcola distanza approssimativa per 1/5 della larghezza della mappa
    const fraction = 0.2;
    const pointA = mapRef.current.latLngToContainerPoint(center);
    const pointB = L.point(pointA.x - containerWidth * fraction, pointA.y);
    const latLngB = mapRef.current.containerPointToLatLng(pointB);
    
    const distance = center.distanceTo(latLngB);
    
    if (distance >= 1000) {
      setScaleDistance(`${Math.round(distance / 1000)} km`);
    } else {
      setScaleDistance(`${Math.round(distance)} m`);
    }
  };

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
    
    // Aggiorna stato radar nel layer pioggia
    const rainLayer = layersRef.current['rain'];
    if (rainLayer && map.hasLayer(rainLayer)) {
      rainLayer.setOpacity(radarState === 'on' ? 0.8 : 0);
    }
  }, [activeLayers, spectralFilter, timeIndex, radarState]);

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

  // Chiudi popup quando si clicca sulla mappa
  useEffect(() => {
    const handleMapClick = () => setPopupInfo(null);
    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '600px' }}>
      <div id="map-container" style={{ width: '100%', height: '100%', zIndex: 1 }} />
      
      {/* Footer con coordinate (ispirato a Zoom Earth) */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '6px',
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
        fontSize: '12px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <span>{Math.abs(coordinates.lat).toFixed(2)}° {coordinates.lat >= 0 ? 'N' : 'S'}</span>
        <span>{Math.abs(coordinates.lng).toFixed(2)}° {coordinates.lng >= 0 ? 'E' : 'O'}</span>
      </div>
      
      {/* Scala di distanza (ispirato a Zoom Earth) */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        padding: '4px 10px',
        borderRadius: '4px',
        zIndex: 1000,
        fontSize: '11px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderRight: '2px solid #fff'
      }}>
        {scaleDistance || '200 km'}
      </div>
      
      {/* Bottone selezione modello meteo (ispirato a Zoom Earth) */}
      <button
        onClick={() => setShowModelPanel(!showModelPanel)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          border: showModelPanel ? '2px solid #3b82f6' : '2px solid transparent',
          borderRadius: '8px',
          padding: '8px 14px',
          zIndex: 1000,
          cursor: 'pointer',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px',
          transition: 'all 0.2s ease'
        }}
        aria-label="Modelli previsionali"
      >
        <span style={{ fontSize: '10px', opacity: 0.8 }}>Modello</span>
        <span>{weatherModel}</span>
      </button>
      
      {/* Pannello selezione modello (ispirato a Zoom Earth) */}
      {showModelPanel && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '12px',
          zIndex: 1000,
          minWidth: '180px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            Modelli previsionali
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: weatherModel === 'ICON' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              border: weatherModel === 'ICON' ? '1px solid #3b82f6' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="model"
                checked={weatherModel === 'ICON'}
                onChange={() => setWeatherModel('ICON')}
                style={{ accentColor: '#3b82f6' }}
              />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>ICON</span>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>13 km</span>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: weatherModel === 'GFS' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              border: weatherModel === 'GFS' ? '1px solid #3b82f6' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="model"
                checked={weatherModel === 'GFS'}
                onChange={() => setWeatherModel('GFS')}
                style={{ accentColor: '#3b82f6' }}
              />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>GFS</span>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>22 km</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Bottone toggle radar (ispirato a Zoom Earth) */}
      <button
        onClick={() => setRadarState(radarState === 'on' ? 'off' : 'on')}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: radarState === 'on' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '8px 14px',
          zIndex: 1000,
          cursor: 'pointer',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
        aria-label="Precipitazioni rilevate dal radar"
        data-state={radarState}
      >
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          background: radarState === 'on' ? '#22c55e' : '#64748b',
          boxShadow: radarState === 'on' ? '0 0 8px #22c55e' : 'none'
        }} />
        Radar
      </button>
      
      {/* Popup overlay trasparente dentro la mappa */}
      {popupInfo && (
        <div
          ref={popupOverlayRef}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: `2px solid ${popupInfo.color}`,
            borderRadius: '12px',
            padding: '1rem',
            zIndex: 1000,
            minWidth: '200px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: popupInfo.color, fontSize: '14px', fontWeight: 600 }}>
            {popupInfo.dataType}
          </h4>
          <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px' }}>
            📍 {popupInfo.location}
          </p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>
            Clicca altrove per chiudere
          </p>
        </div>
      )}
    </div>
  );
};