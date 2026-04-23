# Changelog

Tutte le modifiche significative a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/).

## [2024-01-XX] - Layer Meteo con Dati Mockati

### FEAT - Nuove funzionalità
- **Layer Meteo**: Implementazione dei layer meteorologici (Nuvole, Pioggia, Temperatura, Vento)
- **Dati Mockati**: Creato utility `weatherMockData.ts` per simulare eventi atmosferici con animazioni basate su dati mockati
  - `generateWeatherGrid()`: Genera dati per una griglia spaziale
  - `generateTimeSeries()`: Genera serie temporali di dati meteo
  - `getLayerValue()`: Ottiene valori aggregati per layer
- **Animazione Temporale**: Integrazione del parametro `timeIndex` per animare i layer meteo nel tempo
- **OpenWeatherMap Integration**: Configurazione URL reali per i tile meteorologici da OpenWeatherMap API

### FIX - Correzioni
- **ProfessionalMap.tsx**: Risolto errore TypeScript su `mapRef.current` null check
- **Dashboard.tsx**: Sostituito `NodeJS.Timeout` con `ReturnType<typeof setInterval>` per compatibilità
- **AnalyticsPanel.tsx**: Aggiunta interfaccia `AnalyticsPanelProps` per accettare il prop `timeIndex`

### REFACTOR - Refactoring
- **ProfessionalMap.tsx**: 
  - Importata funzione `getTileSource()` da `dataService.ts` per centralizzare le configurazioni URL
  - Migliorata gestione dei layer meteo con configurazione strutturata
  - Aggiunti commenti per futura integrazione animazione temporale con API esterne
- **ControlPanel.tsx**: Mantenuta interfaccia utente per toggle layer (Nuvole, Pioggia, Temperatura, Vento)

### DOCS - Documentazione
- Commenti aggiuntivi nel codice per spiegare la logica di animazione temporale
- Utility `weatherMockData.ts` completamente documentata con JSDoc

---

## Note Tecniche

### Layer Meteo Implementati
1. **Nuvole (clouds)**: Copertura nuvolosa 0-100%
2. **Pioggia (rain/precip)**: Intensità precipitazioni 0-100%
3. **Temperatura (temp)**: Temperatura in °C con variazioni temporali
4. **Vento (wind)**: Velocità e direzione del vento

### Animazione
- I dati mockati utilizzano funzioni sinusoidali per creare variazioni realistiche nel tempo
- Il parametro `timeIndex` (0-23) rappresenta le ore della giornata
- Le animazioni si aggiornano automaticamente quando cambia `timeIndex`

### Prossimi Passi
- Integrare API Key reale per OpenWeatherMap (attualmente usa 'demo')
- Implementare overlay canvas per visualizzazione avanzata dati mockati
- Aggiungere controllo intensità per ogni layer meteo
