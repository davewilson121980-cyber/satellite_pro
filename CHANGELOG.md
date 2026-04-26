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

