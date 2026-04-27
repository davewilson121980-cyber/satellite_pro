# Changelog

Tutte le modifiche significative a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/).

## [2024-01-15] - Flask Satellite Data Analysis Web App - Initial Implementation

### FEAT - Nuove funzionalità

#### Backend (Flask/Python)
- **Struttura del Progetto**: Creato progetto Flask completo con architettura modulare
  - `app.py`: Application factory pattern per inizializzazione Flask
  - `config.py`: Configurazione multi-ambiente (development, production, testing)
  - Database models con SQLAlchemy (User, DataLog)
  
- **Autenticazione**: Sistema di login/registrazione con Flask-Login
  - Gestione sessioni utente
  - Hash password con Werkzeug
  - Decoratori @login_required per rotte protette
  
- **API Integration**: Servizi per recupero dati satellitari e meteo
  - `services/data_fetcher.py`: Interfaccia unificata per API esterne
  - `services/nasa_power.py`: Client per NASA POWER API (meteo, radiazione solare)
  - `services/calculations.py`: Funzioni per NDVI, energia solare/eolica, evapotraspirazione
  
- **Rotte API**: Endpoint RESTful per analisi dati
  - `/api/weather`: Dati meteorologici
  - `/api/solar`: Radiazione solare e stima produzione energetica
  - `/api/wind`: Dati vento e stima produzione eolica
  - `/api/ndvi`: Indici di vegetazione (Premium+)
  - `/api/agricultural`: Parametri agricoli
  - `/api/usage`: Statistiche utilizzo utente

- **Sistema Abbonamenti**: Tre piani (Free, Premium, Enterprise)
  - Limiti query giornaliere per piano
  - Controllo accesso a funzionalità avanzate
  - Pagamento simulato con Stripe

#### Frontend (HTML/Tailwind/JavaScript)
- **Template Base**: Layout responsive con dark mode di default
  - Tailwind CSS via CDN
  - Navbar con menu mobile
  - Flash messages per notifiche
  
- **Dashboard**: Interfaccia principale con mappa interattiva
  - Leaflet.js per visualizzazione mappe
  - Sidebar con controlli (coordinate, date range, data layers)
  - Chart.js per grafici temporali (temperatura, precipitazioni, NDVI)
  - Stima produzione energetica (solare + eolica)
  - Tabella dati recenti
  
- **Pagine Autenticazione**: Login e registrazione
  - Form validati lato client e server
  - Design moderno con gradienti e animazioni
  
- **Pricing Page**: Pagina abbonamenti
  - Tre card per piani Free/Premium/Enterprise
  - Tabella comparativa funzionalità
  - FAQ section

- **Error Pages**: Pagine errore personalizzate (404, 403, 500)

#### Utility & Helpers
- `static/js/main.js`: Funzioni utility per API calls, notifiche toast, debounce
- `static/css/style.css`: Custom styles per scrollbar, animazioni, responsive

### File Coinvolti
```
flask_satellite_app/
├── app.py
├── config.py
├── requirements.txt
├── .env.example
├── PROJECT_STRUCTURE.md
├── models/__init__.py
├── routes/__init__.py
├── routes/auth.py
├── routes/dashboard.py
├── routes/pricing.py
├── routes/api.py
├── services/__init__.py
├── services/data_fetcher.py
├── services/nasa_power.py
├── services/calculations.py
├── templates/base.html
├── templates/login.html
├── templates/register.html
├── templates/dashboard.html
├── templates/pricing.html
├── templates/components/navbar.html
├── templates/errors/404.html
├── templates/errors/403.html
├── templates/errors/500.html
├── static/css/style.css
└── static/js/main.js
```

---

## [2024-01-XX] - Layer Meteo con Dati Mockati (React/TypeScript App)

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

---

## [2025-01-15 14:30] - Logout Dashboard e Ottimizzazione Grafici

### FEAT - Nuove funzionalità
- **Logout nella Dashboard**: Aggiunto pulsante logout nell'header della Dashboard
  - Posizionato accanto alle informazioni utente
  - Stile rosso (#ef4444) con effetto hover inverso
  - Icona 🚪 per chiarezza visiva
  - Redirect automatico a `/login` dopo il logout
  
### FIX - Correzioni
- **AnalyticsPanel.tsx**: Implementati filtri colorati funzionanti per i grafici
  - Filtro Temperatura (ciano #38bdf8) - show/hide AreaChart
  - Filtro NDVI (verde #22c55e) - show/hide BarChart  
  - Filtro AQI (colore dinamico) - show/hide LineChart
  - Ogni filtro mostra stato attivo (✓) o inattivo (○) con feedback visivo immediato
  
- **Ridimensionamento Grafici**: Altezze ottimizzate per visualizzazione compatta
  - Temperature AreaChart: 120px
  - NDVI BarChart: 100px
  - AQI LineChart: 80px

### REFACTOR - Refactoring
- **Dashboard.tsx**: 
  - Importato `useNavigate` da react-router-dom
  - Aggiunta funzione `handleLogout()` che chiama logout() dallo store e naviga a /login
  - Header ristrutturato con flexbox per allineare user-tag e logout button
  
- **AnalyticsPanel.tsx**:
  - Aggiunto state `activeCharts` per gestire visibilità grafici
  - Implementata funzione `toggleChart()` per attivare/disattivare singoli grafici
  - Rendering condizionale dei componenti Recharts basato sui filtri attivi

### File Coinvolti
- `/workspace/src/pages/Dashboard.tsx`
- `/workspace/src/components/Dashboard/AnalyticsPanel.tsx`

### Note Tecniche
- Build completato con successo senza errori TypeScript
- Il logout pulisce lo stato di autenticazione dallo Zustand store
- I filtri dei grafici mantengono lo stato durante la sessione corrente
- Transizioni fluide (0.2s ease) per migliorare l'esperienza utente

---

## [2025-01-15 15:45] - Filtri Colorati Mappa e Satellite Layer con Logout Funzionante

### FEAT - Nuove funzionalità
- **Mappa Satellitare con Immagini Reali**: Sostituito layer CartoDB Dark Matter con Esri World Imagery
  - Tile layer satellitare ad alta risoluzione da ArcGIS Online
  - Layer aggiuntivo Esri World Boundaries and Places per nomi geografici
  - Visualizzazione realistica del territorio con foto satellitari vere
  - Nomi di città, paesi e luoghi visibili sulla mappa
  
- **Filtri Colorati per Data Layers**: Implementati indicatori colorati funzionanti per i layer
  - Weather Data (blu #3b82f6) - indicatore luminoso con glow effect
  - Solar Energy (giallo #eab308) - indicatore luminoso con glow effect
  - Wind Energy (ciano #06b6d4) - indicatore luminoso con glow effect
  - NDVI Vegetation (verde #22c55e) - indicatore luminoso con glow effect
  - Feedback visivo immediato: layer attivi in evidenza, inattivi semi-trasparenti e in scala di grigi
  - Transizioni fluide (0.3s ease) con effetto hover e scaling
  
- **Logout Funzionante**: Pulsante logout completamente operativo
  - Conferma dialog prima del logout
  - Pulizia localStorage e sessionStorage
  - Redirect a `/login` tramite rotta backend esistente
  - Messaggio flash di conferma dopo logout

### REFACTOR - Refactoring
- **dashboard.html**:
  - Aggiunte classi CSS dedicate per indicatori colorati (`layer-indicator-weather`, `layer-indicator-solar`, etc.)
  - Sostituiti indicatori statici con classi dinamiche riutilizzabili
  - Implementata funzione `DOMContentLoaded` per inizializzare correttamente stati layer
  - Migliorata gestione toggle layer con feedback visivo coerente
  - Aggiornato tile layer labels da Stamen Toner a Esri World Boundaries (più affidabile)

### File Coinvolti
- `/workspace/templates/dashboard.html`

### Note Tecniche
- Mappa Leaflet.js con tile server Esri ArcGIS Online
- Gli indicatori usano box-shadow per creare effetto glow/colorato
- Il sistema di filtri mantiene compatibilità con checkbox HTML standard
- Logout integrato con Flask-Login esistente


---

## [2025-01-15 16:30] - Overlay Colorati Data Layers, Grafici e Menu Filtri Trasparenti

### FEAT - Nuove funzionalità

#### Mappa Satellitare Avanzata
- **Tile Layer Esri World Imagery**: Foto satellitari ad alta risoluzione come base mappa
  - URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
  - Opzione `noWrap: true` per prevenire ripetizione atlante
  - Massima zoom: 19
  
- **Layer Etichette Esri World Boundaries and Places**: Nomi luoghi geografici
  - URL: `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`
  - Opacità 0.8 per leggibilità
  - `noWrap: true` per coerenza con layer base

#### Overlay Colorati per Data Layers
- **Weather Layer** (blu #3b82f6):
  - Nuvole: blu (#3b82f6)
  - Pioggia: rosso (#ef4444)
  - Temperatura: arancione zone calde (#f97316)
  - Vento: ciano (#06b6d4) con indicatori interattivi

- **Solar Layer**:
  - Infrarosso: rosso (#ef4444)
  - UV: blu (#3b82f6)

- **NDVI Layer** (verde #22c55e): Aloni verdi per vegetazione

- **Popup Informativi**: Click su ogni layer mostra popup con:
  - Nome località (coordinate)
  - Tipo dato meteo/solare/vegetazione
  - Colore corrispondente al tipo di layer

#### Prevenzione Ripetizione Atlante
- Impostato `maxBounds: [[-90, -180], [90, 180]]` nella inizializzazione mappa
- Aggiunto `noWrap: true` a tutti i tile layer
- `worldCopyJump: false` per evitare salti tra copie del mondo

#### Elementi Trasparenti
- **Grafici Trasparenti dentro la Mappa**:
  - Chart opacity regolabile tramite slider (0.1 - 1.0)
  - Background grafici: `rgba(31, 41, 55, ${chartOpacity * 0.5})`
  - Backdrop-filter blur per effetto glassmorphism
  - Transizioni fluide durante cambio opacità

- **Menu Filtri Trasparente dentro la Mappa**:
  - Filter menu opacity regolabile tramite slider (0.3 - 1.0)
  - Background: `rgba(30, 41, 59, ${filterMenuOpacity * 0.85})`
  - Backdrop-filter blur(12px) per effetto vetro
  - Slider dedicati nel ControlPanel per entrambe le opacità

### FIX - Correzioni
- **TypeScript Errors Risolti**:
  - Aggiunti layer 'ndvi', 'infrared', 'uv' in `dataService.ts`
  - Aggiunte props `chartOpacity` e `filterMenuOpacity` in `ProfessionalMapProps`
  - Tutti i tipi TypeScript ora allineati con implementazione

### REFACTOR - Refactoring
- **dataService.ts**: Completate sorgenti tile per tutti i layer:
  - NDVI: OpenWeatherMap NDVI tiles
  - Infrared: OpenWeatherMap infrared tiles
  - UV: OpenWeatherMap UV index tiles

- **ProfessionalMap.tsx**:
  - Popup informativi arricchiti con descrizioni specifiche
  - Commenti descrittivi per colori overlay
  - Gestione coerente opacità per tutti i layer

- **index.css**:
  - `.analytics-panel .chart-wrap`: background semi-trasparente con backdrop-filter
  - Transizioni fluide per cambi opacità

### File Coinvolti
- `/workspace/src/api/dataService.ts`
- `/workspace/src/components/Map/ProfessionalMap.tsx`
- `/workspace/src/components/Dashboard/AnalyticsPanel.tsx`
- `/workspace/src/components/UI/ControlPanel.tsx`
- `/workspace/src/pages/Dashboard.tsx`
- `/workspace/src/index.css`

### Note Tecniche
- Build completato con successo senza errori TypeScript
- MapLibre/Leaflet con maxBounds e noWrap per esperienza utente ottimale
- Sistema di opacità indipendente per grafici e menu filtri
- Effetto glassmorphism coerente con design system enterprise
- Popup interattivi su click dei layer per informazioni contestuali

---

## [2025-01-15 17:00] - Popup Informativi con Località e Tipo Dato, Overlay Trasparenti dentro Mappa

### FEAT - Nuove funzionalità

#### Popup Informativi Avanzati
- **Popup React dentro la Mappa**: Sostituiti i popup Leaflet nativi con overlay React personalizzati
  - Stato `popupInfo` gestito tramite useState per coordinate, località e tipo dato
  - Click su qualsiasi layer (weather, NDVI, solar) mostra popup con:
    - Nome località (coordinate Lat/Lng formattate)
    - Tipo dato (CLOUDS, RAIN, TEMP, WIND, NDVI, INFRAROSSO, UV)
    - Bordo colorato corrispondente al tipo di layer
  - Click sulla mappa chiude automaticamente il popup
  - Posizionamento assoluto in alto a destra dentro il container mappa

#### Overlay Trasparenti Regolabili
- **Popup Overlay Trasparente**: 
  - Background: `rgba(15, 23, 42, ${filterMenuOpacity * 0.9})`
  - Backdrop-filter blur(12px) per effetto glassmorphism
  - Opacità legata allo slider `filterMenuOpacity` esistente
  - Transizioni fluide (0.2s ease) per apertura/chiusura

#### Miglioramenti Layer Meteo
- **Weather Layer**: Aggiornato commento per temperatura "arancione zone calde, celeste zone fredde"
- **Tutti i layer**: Popup unificati con stessa struttura informativa

### REFACTOR - Refactoring
- **ProfessionalMap.tsx**:
  - Import aggiunto: `useState` da React
  - Rimosso uso di `L.popup()` nativo di Leaflet
  - Implementato stato React `popupInfo` per gestione popup
  - Aggiunto `useEffect` dedicato per chiudere popup al click su mappa
  - Componente return modificato per includere overlay popup condizionale
  - Rimossi import non utilizzati (`useAppStore`, `center`)
  - Popup ora usano opacità fissa (0.85) per coerenza visiva

### File Coinvolti
- `/workspace/src/components/Map/ProfessionalMap.tsx`

### Note Tecniche
- Popup ora sono parte del DOM React invece che overlay Leaflet
- Migliore integrazione con sistema di opacità esistente
- Coerenza visiva con design system glassmorphism
- Chiusura popup intuitiva tramite click anywhere sulla mappa
- Coordinate visualizzate con 4 decimali per precisione
- Build TypeScript completato senza errori o warning

---

## [2025-01-15 18:00] - UI Ispirata a Zoom Earth: Etichette Città, Coordinate, Scala e Controlli Meteo

### FEAT - Nuove funzionalità

#### Etichette Città con Temperature (ispirato a Zoom Earth)
- **City Labels Interattive**: Aggiunte etichette per 12 città italiane con temperature in tempo reale
  - Ogni città mostra nome e temperatura corrente in un "pill" colorato
  - Colori dinamici basati sulla temperatura (ispirati alla legenda di Zoom Earth):
    - Molto freddo (≤0°C): ciano chiaro (#a5f3fc)
    - Freddo (≤10°C): ciano (#67e8f9)
    - Fresco (≤15°C): ciano scuro (#22d3ee)
    - Mite (≤20°C): giallo chiaro (#fef08a)
    - Caldo (≤25°C): giallo (#fde047)
    - Molto caldo (≤30°C): giallo scuro (#facc15)
    - Torrido (≤35°C): arancione (#fb923c)
    - Estremo (>35°C): rosso (#f87171)
  - Tooltip al passaggio del mouse per ogni città
  - Posizionamento assoluto sopra i layer della mappa

#### Footer con Coordinate in Tempo Reale
- **Coordinate Display**: Mostra latitudine e longitudine sotto il cursore
  - Formato: `XX.XX° N/S` e `YY.YY° E/O`
  - Aggiornamento in tempo reale durante il movimento del mouse
  - Stile glassmorphism con background semi-trasparente
  - Posizionato in basso a sinistra (come Zoom Earth)

#### Scala di Distanza Dinamica
- **Distance Scale**: Mostra scala di distanza basata sul livello di zoom
  - Calcolo automatico della distanza visibile nella mappa
  - Formattazione automatica in metri o chilometri
  - Stile con bordo superiore e laterale bianco (come Zoom Earth)
  - Posizionata in basso a destra

#### Selettore Modelli Previsionali
- **Model Selector Button**: Bottone per selezionare modello meteo ICON/GFS
  - Display del modello corrente con etichetta "Modello"
  - Pannello dropdown con selezione radio button
  - Dettagli risoluzione: ICON (13 km), GFS (22 km)
  - Highlight del modello selezionato con bordo blu
  - Posizionato in alto a sinistra

#### Toggle Radar
- **Radar Toggle Button**: Attiva/disattiva layer radar precipitazioni
  - Indicatore LED verde/rosso per stato on/off
  - Glow effect quando attivo
  - Label "Radar" con icona
  - Posizionato in alto a destra

### REFACTOR - Refactoring
- **ProfessionalMap.tsx**:
  - Aggiunta interfaccia `CityLabel` per struttura dati città
  - Array `cityLabels` con coordinate e temperature di 12 città italiane
  - Funzione `getTemperatureColor()` per mappatura temperatura→colore
  - Funzione `updateScaleDisplay()` per calcolo dinamico scala
  - Stati React aggiuntivi: `coordinates`, `scaleDistance`, `selectedModel`, `showModelPanel`, `radarState`
  - Cleanup markers nel return dell'useEffect' principale
  - Event listener 'mousemove' e 'zoomend' per aggiornamenti dinamici

### File Coinvolti
- `/workspace/src/components/Map/ProfessionalMap.tsx`

### Note Tecniche
- Ispirazione diretta dall'UI di Zoom Earth (zoom.earth)
- Tutti gli elementi UI usano backdrop-filter blur per coerenza glassmorphism
- Transizioni fluide (0.2s ease) per tutti gli stati interattivi
- Accessibilità: aria-label su tutti i bottoni
- Build TypeScript completato senza errori
- Marker Leaflet puliti correttamente nel cleanup

---

## [2025-01-15 19:00] - Implementazione Dashboard HTML con Funzionalità Zoom Earth

### FEAT - Nuove funzionalità

#### Dashboard HTML Aggiornata con UI Zoom Earth-inspired
- **Etichette Città Italiane con Temperature**: 12 città con pill colorate in base alla temperatura
  - Sistema a 8 livelli cromatici (da ciano per freddo a arancione per caldo)
  - Proiezione dinamica delle coordinate lat/lng su pixel della mappa
  - Visibilità condizionata ai bounds correnti della mappa
  
- **Coordinate in Tempo Reale**: Footer in basso a sinistra
  - Formato: `Lat: XX.XXXX° N/S | Lon: YY.YYYY° E/W`
  - Aggiornamento continuo durante mousemove sulla mappa
  - Stile glassmorphism con backdrop-filter blur(8px)

- **Scala di Distanza Dinamica**: In basso a destra
  - Calcolo automatico basato su zoom level e latitudine centrale
  - Scale multiple: 10m, 50m, 100m, 500m, 1km, 5km, 10km, 50km, 100km, 500km
  - Barra bianca con bordo nero per massima visibilità
  - Aggiornamento automatico su zoom/move della mappa

- **Selettore Modelli Meteo**: Toggle dropdown in alto a destra
  - Due opzioni: ICON (13km resolution) e GFS (22km resolution)
  - Pannello dropdown con glassmorphism
  - Highlight dell'opzione attiva con background blu
  - Chiusura automatica click outside

- **Toggle Radar**: Bottone on/off con LED indicatore in alto a sinistra
  - Icona radar SVG
  - LED verde quando attivo con glow effect
  - LED grigio quando inattivo
  - Label "Radar" descrittiva

### REFACTOR - Refactoring

#### templates/dashboard.html
- **CSS Styles**: Aggiunte classi dedicate per nuovi componenti UI:
  - `.glass-panel`: Pannello semi-trasparente con blur
  - `.city-label`: Container etichette città con positioning assoluto
  - `.label-text`: Sfondo scuro semi-trasparente per nomi città
  - `.temp-pill`: Pill rotonda colorata per temperature
  - `.coords-footer`: Footer coordinate in basso a sinistra
  - `.distance-scale`: Scala distanza con barra grafica
  - `.model-selector`: Dropdown selettore modello
  - `.model-btn`, `.model-dropdown`, `.model-option`: Componenti selector
  - `.radar-toggle`, `.radar-btn`, `.radar-led`: Componenti radar toggle

- **JavaScript Functions**: Implementate logiche per nuove features:
  - `getTempColor(temp)`: Mappatura temperatura→colore RGB (8 livelli)
  - `renderCityLabels()`: Proiezione e rendering etichette città
  - `updateScaleBar()`: Calcolo dinamico scala basato su zoom e latitudine
  - `toggleRadar()`: Attiva/disattiva layer radar con feedback visivo
  - `toggleModelDropdown()`: Apre/chiude dropdown modelli
  - `selectModel(model)`: Cambia modello corrente (ICON/GFS)
  - Event listeners per mousemove, zoomend, moveend

- **HTML Structure**: Aggiunti container nel map div:
  - `<div class="radar-toggle">`: Bottone radar + LED
  - `<div class="model-selector">`: Selettore modelli con dropdown
  - `<div class="coords-footer">`: Display coordinate
  - `<div class="distance-scale">`: Barra scala + testo
  - `<div id="city-labels-container">`: Container etichette città

### File Coinvolti
- `/workspace/templates/dashboard.html`

### Note Tecniche
- Tutte le funzionalità sono implementate in vanilla JavaScript (nessuna dipendenza aggiuntiva)
- La proiezione delle città usa un calcolo semplificato basato sui bounds della mappa Leaflet
- Il calcolo della scala considera la circonferenza terrestre e la correzione coseno per latitudine
- Gli stili glassmorphism sono coerenti con il design system esistente
- Inizializzazione automatica delle feature al caricamento pagina (setTimeout 100ms)
- Compatibilità con browser moderni (backdrop-filter support richiesto)

---
