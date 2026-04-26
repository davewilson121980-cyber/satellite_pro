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
