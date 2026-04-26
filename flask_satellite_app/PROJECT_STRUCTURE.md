# Satellite Data Analysis Web App - Project Structure

## Directory Layout

```
flask_satellite_app/
├── app.py                  # Main Flask application entry point
├── config.py               # Configuration settings (DB, API keys, etc.)
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (API keys, secrets)
│
├── models/                 # Database models
│   ├── __init__.py
│   ├── user.py             # User model for authentication
│   └── data_log.py         # Log model for tracking data requests
│
├── routes/                 # Flask blueprints for routes
│   ├── __init__.py
│   ├── auth.py             # Authentication routes (login, register)
│   ├── dashboard.py        # Dashboard and main app routes
│   ├── pricing.py          # Pricing/subscription routes
│   └── api.py              # API endpoints for data fetching
│
├── services/               # Business logic and external API integrations
│   ├── __init__.py
│   ├── data_fetcher.py     # Satellite/weather API integration
│   ├── nasa_power.py       # NASA POWER API client
│   ├── sentinel_hub.py     # Sentinel-Hub API client
│   ├── calculations.py     # NDVI, solar/wind energy calculations
│   └── payment.py          # Payment processing (Stripe simulation)
│
├── templates/              # HTML templates
│   ├── base.html           # Base template with common layout
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── pricing.html        # Pricing/subscription page
│   ├── dashboard.html      # Main dashboard with map
│   └── components/         # Reusable template components
│       ├── sidebar.html
│       └── navbar.html
│
├── static/                 # Static assets
│   ├── css/
│   │   └── style.css       # Custom styles (Tailwind via CDN)
│   └── js/
│       ├── map.js          # Leaflet map initialization
│       ├── charts.js       # Chart.js configurations
│       └── dashboard.js    # Dashboard interactivity
│
└── utils/                  # Helper functions
    ├── __init__.py
    ├── decorators.py       # Custom decorators (login_required, etc.)
    └── helpers.py          # Utility functions
```

## Technology Stack

### Backend
- **Flask**: Web framework
- **Flask-Login**: Session management
- **Flask-SQLAlchemy**: ORM for database operations
- **PostgreSQL + PostGIS**: Database with geospatial support (SQLite for prototyping)
- **python-dotenv**: Environment variable management
- **requests**: HTTP client for API calls

### Frontend
- **HTML5/CSS3**: Structure and styling
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)**: Client-side logic
- **Leaflet.js**: Interactive maps
- **Leaflet-velocity**: Wind animation layer
- **Chart.js**: Data visualization
- **Plotly.js**: Advanced charts (optional)

### External APIs
- **NASA POWER**: Weather, solar radiation, agricultural data
- **Sentinel-Hub**: Satellite imagery, NDVI, spectral bands
- **OpenWeatherMap**: Current weather and forecasts (alternative)
- **Stripe**: Payment processing (simulated)

## Key Features

### Authentication & Business
- User registration and login with session management
- Three-tier subscription model (Free, Premium, Enterprise)
- Simulated payment integration

### Dashboard & Data Analysis
- Interactive map with coordinate/area selection
- Weather parameters: temperature, humidity, precipitation, wind speed
- Vegetation analysis: NDVI, EVI, evapotranspiration, water stress
- Renewable energy: Solar production estimation, wind energy potential
- Electromagnetic spectrum: UV, NIR, SWIR visualization

### UI/UX
- Sidebar with filters and controls
- Smooth animations for map layer loading
- Dark mode by default
- Responsive design

## Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL with PostGIS (or SQLite for development)
- Node.js (for frontend build tools, optional)

### Installation

1. Clone the repository
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://user:password@localhost/dbname
   NASA_POWER_API_URL=https://power.larc.nasa.gov/api/temporal/daily/point
   SENTINEL_HUB_CLIENT_ID=your-client-id
   SENTINEL_HUB_CLIENT_SECRET=your-client-secret
   STRIPE_SECRET_KEY=sk_test_your-key
   ```

5. Initialize database:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. Run the application:
   ```bash
   flask run
   ```

## API Integration Notes

### NASA POWER API
- Free for research and educational purposes
- Provides: meteorological data, solar radiation, agricultural parameters
- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Parameters: latitude, longitude, dates, parameters (ALLSKY_SFC_SW_DWN, T2M, etc.)

### Sentinel-Hub API
- Requires account and API credentials
- Provides: satellite imagery, spectral indices (NDVI, EVI), custom scripts
- Authentication: OAuth2 client credentials flow
- Best for: vegetation analysis, land cover, spectral analysis

## Calculation Formulas

### NDVI (Normalized Difference Vegetation Index)
```
NDVI = (NIR - Red) / (NIR + Red)
```
Range: -1 to 1 (higher values indicate healthier vegetation)

### Solar Energy Production Estimation
```
Power = GHI × Panel_Area × Efficiency × Performance_Ratio
```
Where:
- GHI = Global Horizontal Irradiance (kWh/m²/day)
- Panel_Area = Total panel surface area (m²)
- Efficiency = Panel efficiency (typically 0.15-0.22)
- Performance_Ratio = System losses factor (typically 0.75-0.85)

### Wind Energy Potential
```
Power = 0.5 × Air_Density × Rotor_Area × Wind_Speed³
```
Wind speed adjustment for height using power law:
```
V₂ = V₁ × (H₂/H₁)^α
```
Where α ≈ 0.143 (1/7) for open terrain

## Development Guidelines

Refer to `INSTRUCTIONS.md` for detailed development protocols including:
- Pre-modification analysis requirements
- Coding standards (modularity, DRY, clean code)
- Changelog management
- Workflow procedures

## License

This project is for educational and demonstration purposes.
