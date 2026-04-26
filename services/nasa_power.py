"""
NASA POWER API Client - Fetch meteorological and solar data.

NASA POWER (Prediction Of Worldwide Energy Resources) provides free access
to meteorological and solar radiation data for research and educational purposes.

API Documentation: https://power.larc.nasa.gov/
"""

import requests
from typing import Dict, List, Optional, Any
from datetime import datetime


class NASAPowerClient:
    """
    Client for NASA POWER API.
    
    Provides methods to fetch daily and hourly meteorological data,
    solar radiation parameters, and agricultural metrics.
    """
    
    def __init__(self, config=None):
        """
        Initialize the NASA POWER client.
        
        Args:
            config: Configuration object with API settings
        """
        self.base_url = config.NASA_POWER_API_URL if config else \
            'https://power.larc.nasa.gov/api/temporal/daily/point'
        self.timeout = config.NASA_POWER_TIMEOUT if config else 30
        self.session = requests.Session()
    
    def get_daily_data(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
        parameters: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch daily data for a specific location and date range.
        
        Args:
            latitude: Location latitude (-90 to 90)
            longitude: Location longitude (-180 to 180)
            start_date: Start date in YYYYMMDD format
            end_date: End date in YYYYMMDD format
            parameters: List of specific parameters to fetch.
                       If None, fetches common meteorological parameters.
        
        Returns:
            Dictionary containing time series data and metadata
            
        Raises:
            requests.RequestException: If API request fails
            ValueError: If parameters are invalid
        """
        # Validate coordinates
        if not -90 <= latitude <= 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {latitude}")
        if not -180 <= longitude <= 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {longitude}")
        
        # Default parameters if none specified
        if parameters is None:
            parameters = [
                'T2M',           # Temperature at 2 meters
                'RH2M',          # Relative humidity at 2 meters
                'PRECTOTCORR',   # Precipitation
                'WS10M',         # Wind speed at 10 meters
                'ALLSKY_SFC_SW_DWN',  # Solar radiation
                'PS'             # Surface pressure
            ]
        
        # Build API request
        params = {
            'parameters': ','.join(parameters),
            'community': 'AG',  # Agriculture community (can also be 'SB' for Sustainable Buildings)
            'longitude': longitude,
            'latitude': latitude,
            'start': start_date,
            'end': end_date,
            'format': 'JSON'
        }
        
        try:
            response = self.session.get(
                self.base_url,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Parse and format the response
            return self._parse_response(data, parameters)
            
        except requests.Timeout:
            raise requests.RequestException(f"Request timed out after {self.timeout} seconds")
        except requests.RequestException as e:
            raise requests.RequestException(f"NASA POWER API request failed: {str(e)}")
    
    def _parse_response(self, raw_data: Dict, parameters: List[str]) -> Dict[str, Any]:
        """
        Parse raw API response into a more usable format.
        
        Args:
            raw_data: Raw JSON response from NASA POWER API
            parameters: List of requested parameters
            
        Returns:
            Formatted dictionary with time series data
        """
        try:
            # Navigate the nested JSON structure
            properties = raw_data.get('properties', {})
            parameter_data = properties.get('parameter', {})
            
            # Extract time series for each parameter
            time_series = {}
            dates = []
            
            for param in parameters:
                if param in parameter_data:
                    param_values = parameter_data[param]
                    
                    # First value might be metadata, rest are daily values
                    if isinstance(param_values, dict):
                        # Extract dates from the first key
                        dates = list(param_values.keys())
                        values = list(param_values.values())
                        
                        time_series[param] = {
                            'dates': dates,
                            'values': values,
                            'units': self._get_parameter_units(param)
                        }
            
            # Extract metadata
            metadata = {
                'latitude': properties.get('latitude', {}).get('value'),
                'longitude': properties.get('longitude', {}).get('value'),
                'source': 'NASA POWER',
                'api_version': raw_data.get('version', 'unknown')
            }
            
            return {
                'status': 'success',
                'metadata': metadata,
                'time_series': time_series,
                'date_range': {
                    'start': dates[0] if dates else None,
                    'end': dates[-1] if dates else None
                }
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to parse response: {str(e)}',
                'raw_data': raw_data
            }
    
    def _get_parameter_units(self, parameter: str) -> str:
        """
        Get the unit of measurement for a parameter.
        
        Args:
            parameter: Parameter code (e.g., 'T2M', 'PRECTOTCORR')
            
        Returns:
            Unit string
        """
        units = {
            'T2M': '°C',
            'RH2M': '%',
            'PRECTOTCORR': 'mm/day',
            'WS10M': 'm/s',
            'WS50M': 'm/s',
            'WS100M': 'm/s',
            'ALLSKY_SFC_SW_DWN': 'kWh/m²/day',
            'ALLSKY_KT': 'dimensionless',
            'PS': 'kPa',
            'EVPTRM': 'mm/day',
            'LWPC': 'index',
            'SOLAR_ZENITH_ANGLE': 'degrees',
            'TOA_SW_DWN': 'kWh/m²/day'
        }
        return units.get(parameter, 'unknown')
    
    def get_climatology(
        self,
        latitude: float,
        longitude: float,
        parameter: str = 'T2M'
    ) -> Dict[str, Any]:
        """
        Fetch climatological data (long-term averages).
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            parameter: Parameter to fetch climatology for
            
        Returns:
            Dictionary containing monthly climatology values
        """
        # TODO: Implement climatology endpoint
        # This would use a different API endpoint for long-term averages
        return {
            'status': 'not_implemented',
            'message': 'Climatology endpoint not yet implemented'
        }
    
    def close(self):
        """Close the session and clean up resources."""
        self.session.close()


# Convenience function for quick data fetching
def fetch_nasa_power_data(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    parameters: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Convenience function to fetch NASA POWER data without creating a client.
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
        start_date: Start date in YYYYMMDD format
        end_date: End date in YYYYMMDD format
        parameters: List of parameters to fetch
        
    Returns:
        Dictionary containing time series data
    """
    client = NASAPowerClient()
    try:
        return client.get_daily_data(latitude, longitude, start_date, end_date, parameters)
    finally:
        client.close()
