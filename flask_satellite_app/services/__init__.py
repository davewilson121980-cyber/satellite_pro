"""
Services package for external API integrations and business logic.
"""

from .data_fetcher import DataFetcher
from .nasa_power import NASAPowerClient
from .calculations import (
    calculate_ndvi,
    calculate_solar_power,
    calculate_wind_power,
    adjust_wind_speed_for_height
)

__all__ = [
    'DataFetcher',
    'NASAPowerClient',
    'calculate_ndvi',
    'calculate_solar_power',
    'calculate_wind_power',
    'adjust_wind_speed_for_height'
]
