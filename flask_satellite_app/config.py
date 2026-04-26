import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_APP = os.environ.get('FLASK_APP', 'app.py')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # Session settings
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Database settings
    # Use SQLite for prototyping, PostgreSQL for production
    DATABASE_URL = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///satellite_data.db'
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # PostGIS settings (for PostgreSQL)
    POSTGIS_ENABLED = os.environ.get('POSTGIS_ENABLED', 'False').lower() == 'true'
    
    # NASA POWER API settings
    NASA_POWER_API_URL = os.environ.get(
        'NASA_POWER_API_URL',
        'https://power.larc.nasa.gov/api/temporal/daily/point'
    )
    NASA_POWER_TIMEOUT = 30
    
    # Sentinel-Hub API settings
    SENTINEL_HUB_API_URL = os.environ.get(
        'SENTINEL_HUB_API_URL',
        'https://services.sentinel-hub.com'
    )
    SENTINEL_HUB_CLIENT_ID = os.environ.get('SENTINEL_HUB_CLIENT_ID', '')
    SENTINEL_HUB_CLIENT_SECRET = os.environ.get('SENTINEL_HUB_CLIENT_SECRET', '')
    SENTINEL_HUB_TIMEOUT = 60
    
    # Stripe settings (payment simulation)
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_simulation')
    STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', 'pk_test_simulation')
    
    # Subscription plans
    SUBSCRIPTION_PLANS = {
        'free': {
            'name': 'Free',
            'price': 0,
            'features': [
                'Basic weather data',
                'Limited map queries (10/day)',
                'Standard resolution',
                'Community support'
            ],
            'limitations': {
                'daily_queries': 10,
                'data_retention_days': 7,
                'api_rate_limit': 100
            }
        },
        'premium': {
            'name': 'Premium',
            'price': 29.99,
            'features': [
                'All weather parameters',
                'Unlimited map queries',
                'High resolution imagery',
                'NDVI & vegetation analysis',
                'Solar energy estimation',
                'Email support'
            ],
            'limitations': {
                'daily_queries': 1000,
                'data_retention_days': 90,
                'api_rate_limit': 500
            }
        },
        'enterprise': {
            'name': 'Enterprise',
            'price': 99.99,
            'features': [
                'Everything in Premium',
                'Wind energy analysis',
                'Full spectral analysis',
                'Custom calculations',
                'API access',
                'Priority support',
                'SLA guarantee'
            ],
            'limitations': {
                'daily_queries': -1,  # unlimited
                'data_retention_days': 365,
                'api_rate_limit': 2000
            }
        }
    }
    
    # Map default settings
    DEFAULT_LATITUDE = 41.9028  # Rome, Italy
    DEFAULT_LONGITUDE = 12.4964
    DEFAULT_ZOOM = 6


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    
    # Force PostgreSQL in production
    if Config.DATABASE_URL.startswith('sqlite'):
        raise ValueError("SQLite not supported in production. Use PostgreSQL.")


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
