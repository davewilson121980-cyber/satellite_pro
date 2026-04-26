"""
Data Fetcher Service - Main interface for retrieving satellite and weather data.

This module provides a unified interface for fetching data from multiple sources:
- NASA POWER: Weather, solar radiation, agricultural parameters
- Sentinel-Hub: Satellite imagery, vegetation indices, spectral data
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from .nasa_power import NASAPowerClient


class DataFetcher:
    """
    Main data fetching service that coordinates requests to various APIs.
    
    This class acts as a facade, providing simplified methods for common
    data retrieval operations while handling caching, rate limiting,
    and error handling.
    """
    
    def __init__(self, config=None):
        """
        Initialize the data fetcher with configuration.
        
        Args:
            config: Configuration object with API settings
        """
        self.config = config
        self.nasa_power = NASAPowerClient(config)
        self.session = requests.Session()
        
        # Rate limiting
        self.request_count = 0
        self.last_reset = datetime.now()
    
    def get_weather_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        parameters: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch weather data for a specific location and date range.
        
        Args:
            latitude: Location latitude (-90 to 90)
            longitude: Location longitude (-180 to 180)
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            parameters: List of specific parameters to fetch
            
        Returns:
            Dictionary containing weather data and metadata
            
        Example:
            >>> fetcher = DataFetcher()
            >>> data = fetcher.get_weather_data(41.9, 12.5, '20240101', '20240131')
            >>> print(data['temperature_2m'])
        """
        return self.nasa_power.get_daily_data(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            parameters=parameters
        )
    
    def get_solar_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """
        Fetch solar radiation data for energy production estimation.
        
        Retrieves Global Horizontal Irradiance (GHI) and related parameters.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            
        Returns:
            Dictionary containing solar radiation parameters
        """
        solar_params = [
            'ALLSKY_SFC_SW_DWN',  # Surface downward shortwave radiation
            'ALLSKY_KT',          # Clearness index
            'SOLAR_ZENITH_ANGLE', # Solar zenith angle
            'TOA_SW_DWN'          # Top of atmosphere radiation
        ]
        
        return self.nasa_power.get_daily_data(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            parameters=solar_params
        )
    
    def get_wind_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        heights: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Fetch wind speed data at different heights for energy estimation.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            heights: List of heights in meters (default: [10, 50, 100])
            
        Returns:
            Dictionary containing wind speed data at requested heights
        """
        if heights is None:
            heights = [10, 50, 100]
        
        wind_params = [f'WIND{h}M' for h in heights]
        
        return self.nasa_power.get_daily_data(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            parameters=wind_params
        )
    
    def get_agricultural_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """
        Fetch agricultural parameters including evapotranspiration and precipitation.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            
        Returns:
            Dictionary containing agricultural parameters
        """
        agri_params = [
            'PRECTOTCORR',        # Precipitation
            'EVPTRM',             # Evapotranspiration
            'RH2M',               # Relative humidity
            'T2M',                # Temperature
            'LWPC'                # Leaf wetness potential
        ]
        
        return self.nasa_power.get_daily_data(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            parameters=agri_params
        )
    
    def get_ndvi_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        use_sentinel: bool = True
    ) -> Dict[str, Any]:
        """
        Fetch NDVI (Normalized Difference Vegetation Index) data.
        
        Note: For production use with Sentinel-Hub, implement the sentinel_hub.py
        module. This method currently returns simulated data for demonstration.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            start_date: Start date in YYYYMMDD format
            end_date: Start date in YYYYMMDD format
            use_sentinel: If True, attempt to use Sentinel-Hub API
            
        Returns:
            Dictionary containing NDVI time series data
        """
        if use_sentinel and self.config:
            # TODO: Implement Sentinel-Hub integration
            # This would call sentinel_hub.get_ndvi_time_series()
            pass
        
        # Return simulated NDVI data for demonstration
        # In production, this would come from Sentinel-2 imagery
        return {
            'status': 'simulated',
            'message': 'NDVI data simulation - implement Sentinel-Hub for real data',
            'location': {
                'latitude': latitude,
                'longitude': longitude
            },
            'date_range': {
                'start': start_date,
                'end': end_date
            },
            'data': []  # Would contain NDVI values per date
        }
    
    def get_spectral_data(
        self,
        latitude: float,
        longitude: float,
        date: str,
        bands: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch multispectral data for specific wavelength bands.
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            date: Date in YYYYMMDD format
            bands: List of spectral bands (e.g., ['B04', 'B08', 'B11'] for Sentinel-2)
            
        Returns:
            Dictionary containing reflectance values for each band
        """
        # TODO: Implement Sentinel-Hub integration for spectral data
        # Bands would include: B02 (Blue), B03 (Green), B04 (Red),
        # B08 (NIR), B11 (SWIR1), B12 (SWIR2)
        
        return {
            'status': 'simulated',
            'message': 'Spectral data simulation - implement Sentinel-Hub for real data',
            'location': {
                'latitude': latitude,
                'longitude': longitude
            },
            'date': date,
            'bands': bands or ['B04', 'B08', 'B11'],
            'data': {}
        }
    
    def _check_rate_limit(self) -> bool:
        """
        Check if request is within rate limits.
        
        Returns:
            True if request is allowed, False if rate limited
        """
        now = datetime.now()
        
        # Reset counter every hour
        if (now - self.last_reset).seconds > 3600:
            self.request_count = 0
            self.last_reset = now
        
        # Simple rate limiting (can be enhanced based on subscription plan)
        if self.request_count > 100:
            return False
        
        return True
    
    def _increment_request_count(self):
        """Increment the request counter."""
        self.request_count += 1
    
    def close(self):
        """Close the session and clean up resources."""
        self.session.close()
