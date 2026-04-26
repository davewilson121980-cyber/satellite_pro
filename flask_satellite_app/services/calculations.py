"""
Calculation utilities for agricultural and renewable energy analysis.

This module provides functions for:
- Vegetation indices (NDVI, EVI)
- Solar energy production estimation
- Wind energy potential calculation
- Evapotranspiration calculations
"""

from typing import Dict, List, Optional, Any


def calculate_ndvi(nir: float, red: float) -> Optional[float]:
    """
    Calculate Normalized Difference Vegetation Index (NDVI).
    
    NDVI is a simple graphical indicator that can be used to analyze
    remote sensing measurements and assess whether the target being
    observed contains live green vegetation or not.
    
    Formula: NDVI = (NIR - Red) / (NIR + Red)
    
    Args:
        nir: Near-Infrared reflectance value (0-1 or 0-10000 depending on source)
        red: Red band reflectance value (0-1 or 0-10000)
        
    Returns:
        NDVI value between -1 and 1, or None if invalid input
        
    Interpretation:
        -1 to 0: Water, snow, clouds
        0 to 0.2: Bare soil, rock, sand
        0.2 to 0.5: Sparse vegetation, shrubs, grasslands
        0.5 to 0.8: Dense vegetation, forests
        0.8 to 1.0: Very dense, healthy vegetation
    """
    if nir < 0 or red < 0:
        return None
    
    denominator = nir + red
    if denominator == 0:
        return 0
    
    ndvi = (nir - red) / denominator
    
    # Clamp to valid range
    return max(-1.0, min(1.0, ndvi))


def calculate_evi(nir: float, red: float, blue: float) -> Optional[float]:
    """
    Calculate Enhanced Vegetation Index (EVI).
    
    EVI is similar to NDVI but minimizes canopy-soil variations and
    improves sensitivity over high biomass regions.
    
    Formula: EVI = G * (NIR - Red) / (NIR + C1 * Red - C2 * Blue + L)
    
    Where:
        G = 2.5 (gain factor)
        C1 = 6 (coefficient 1)
        C2 = 7.5 (coefficient 2)
        L = 1 (canopy background adjustment)
    
    Args:
        nir: Near-Infrared reflectance
        red: Red band reflectance
        blue: Blue band reflectance
        
    Returns:
        EVI value, typically between -1 and 1, or None if invalid
    """
    if nir < 0 or red < 0 or blue < 0:
        return None
    
    # EVI coefficients
    G = 2.5
    C1 = 6.0
    C2 = 7.5
    L = 1.0
    
    denominator = nir + C1 * red - C2 * blue + L
    if denominator == 0:
        return 0
    
    evi = G * (nir - red) / denominator
    
    return evi


def calculate_solar_power(
    ghi: float,
    panel_area: float,
    efficiency: float = 0.20,
    performance_ratio: float = 0.80
) -> float:
    """
    Estimate solar power production.
    
    Calculates the expected power output from a solar panel system
    based on Global Horizontal Irradiance (GHI) and system parameters.
    
    Formula: Power = GHI × Panel_Area × Efficiency × Performance_Ratio
    
    Args:
        ghi: Global Horizontal Irradiance (kWh/m²/day)
        panel_area: Total panel surface area (m²)
        efficiency: Panel efficiency (0.0 to 1.0, typically 0.15-0.22)
        performance_ratio: System losses factor (0.0 to 1.0, typically 0.75-0.85)
                          Accounts for temperature, soiling, wiring losses, etc.
        
    Returns:
        Estimated daily energy production in kWh/day
        
    Example:
        >>> calculate_solar_power(5.0, 20, 0.20, 0.80)
        16.0  # kWh/day
    """
    # Validate inputs
    ghi = max(0, ghi)
    panel_area = max(0, panel_area)
    efficiency = max(0, min(1, efficiency))
    performance_ratio = max(0, min(1, performance_ratio))
    
    return ghi * panel_area * efficiency * performance_ratio


def calculate_wind_power(
    wind_speed: float,
    rotor_diameter: float,
    air_density: float = 1.225,
    power_coefficient: float = 0.40
) -> float:
    """
    Calculate wind turbine power output.
    
    Estimates the power available in the wind that can be captured
    by a wind turbine.
    
    Formula: Power = 0.5 × ρ × A × v³ × Cp
    
    Where:
        ρ = air density (kg/m³)
        A = rotor swept area (m²)
        v = wind speed (m/s)
        Cp = power coefficient (Betz limit = 0.593, practical = 0.35-0.45)
    
    Args:
        wind_speed: Wind speed at hub height (m/s)
        rotor_diameter: Turbine rotor diameter (m)
        air_density: Air density (kg/m³), default is sea level at 15°C
        power_coefficient: Turbine efficiency (0.0 to 0.593)
        
    Returns:
        Power output in Watts
        
    Example:
        >>> calculate_wind_power(10, 80, 1.225, 0.40)
        ~246,000 W (246 kW)
    """
    # Validate inputs
    wind_speed = max(0, wind_speed)
    rotor_diameter = max(0, rotor_diameter)
    air_density = max(0, air_density)
    power_coefficient = max(0, min(0.593, power_coefficient))
    
    # Calculate rotor swept area
    radius = rotor_diameter / 2
    area = 3.14159 * radius ** 2
    
    # Calculate power (v³ is critical - small changes in wind speed have large effects)
    power = 0.5 * air_density * area * (wind_speed ** 3) * power_coefficient
    
    return power


def adjust_wind_speed_for_height(
    wind_speed: float,
    reference_height: float,
    target_height: float,
    alpha: float = 0.143
) -> float:
    """
    Adjust wind speed for different heights using the power law.
    
    Wind speed increases with height due to reduced surface friction.
    The power law is a simple model for this vertical profile.
    
    Formula: V₂ = V₁ × (H₂/H₁)^α
    
    Where:
        V₁ = wind speed at reference height
        H₁ = reference height
        H₂ = target height
        α = Hellmann exponent (typically 0.143 or 1/7 for open terrain)
    
    Args:
        wind_speed: Measured wind speed (m/s)
        reference_height: Height of measurement (m)
        target_height: Desired height for estimation (m)
        alpha: Hellmann exponent
               - 0.143 (1/7): Open terrain, neutral stability
               - 0.20-0.30: Forested areas
               - 0.10: Smooth surfaces (water, ice)
        
    Returns:
        Estimated wind speed at target height (m/s)
        
    Example:
        >>> adjust_wind_speed_for_height(5, 10, 80, 0.143)
        ~7.2 m/s (wind speed at 80m based on 5 m/s at 10m)
    """
    if reference_height <= 0 or target_height <= 0:
        return wind_speed
    
    if wind_speed < 0:
        return 0
    
    ratio = target_height / reference_height
    adjusted_speed = wind_speed * (ratio ** alpha)
    
    return adjusted_speed


def calculate_evapotranspiration(
    temperature: float,
    humidity: float,
    solar_radiation: float,
    wind_speed: float,
    latitude: float,
    day_of_year: int
) -> float:
    """
    Estimate reference evapotranspiration (ET₀) using simplified Penman-Monteith.
    
    Evapotranspiration is crucial for agricultural planning and
    irrigation management.
    
    This is a simplified implementation. For production use, consider
    using the full FAO-56 Penman-Monteith equation.
    
    Args:
        temperature: Daily mean temperature (°C)
        humidity: Relative humidity (%)
        solar_radiation: Solar radiation (MJ/m²/day)
        wind_speed: Wind speed at 2m height (m/s)
        latitude: Location latitude (degrees)
        day_of_year: Day of year (1-365)
        
    Returns:
        Reference evapotranspiration (mm/day)
    """
    import math
    
    # Constants
    T = temperature  # Mean temperature (°C)
    RH = humidity / 100.0  # Relative humidity (0-1)
    Rn = solar_radiation  # Net radiation (MJ/m²/day)
    u2 = wind_speed  # Wind speed at 2m (m/s)
    
    # Saturation vapor pressure (kPa)
    es = 0.6108 * math.exp((17.27 * T) / (T + 237.3))
    
    # Actual vapor pressure (kPa)
    ea = es * RH
    
    # Slope of saturation vapor pressure curve (kPa/°C)
    delta = (4098 * es) / ((T + 237.3) ** 2)
    
    # Psychrometric constant (kPa/°C)
    gamma = 0.000665  # Simplified, varies with elevation
    
    # Soil heat flux density (MJ/m²/day) - assumed 0 for daily calculations
    G = 0
    
    # Penman-Monteith equation
    numerator = 0.408 * delta * (Rn - G) + gamma * (37 / (T + 273)) * u2 * (es - ea)
    denominator = delta + gamma * (1 + 0.34 * u2)
    
    et0 = numerator / denominator
    
    return max(0, et0)


def calculate_water_stress_index(ndvi_current: float, ndvi_reference: float) -> float:
    """
    Calculate vegetation water stress index.
    
    Compares current NDVI to a reference (healthy) NDVI to assess
    water stress in vegetation.
    
    Args:
        ndvi_current: Current NDVI value
        ndvi_reference: Reference NDVI for healthy vegetation in same area
        
    Returns:
        Water stress index (0-1, where 1 = no stress, 0 = severe stress)
    """
    if ndvi_reference <= 0:
        return 1.0  # No reference, assume no stress
    
    if ndvi_current >= ndvi_reference:
        return 1.0  # Vegetation is healthy or better than reference
    
    stress_index = ndvi_current / ndvi_reference
    return max(0, min(1, stress_index))


def estimate_irrigation_requirement(
    et0: float,
    precipitation: float,
    crop_coefficient: float = 1.0,
    efficiency: float = 0.85
) -> float:
    """
    Estimate irrigation water requirement.
    
    Calculates how much irrigation water is needed based on
    evapotranspiration and natural precipitation.
    
    Args:
        et0: Reference evapotranspiration (mm/day)
        precipitation: Effective precipitation (mm/day)
        crop_coefficient: Crop-specific coefficient (0.5-1.2)
        efficiency: Irrigation system efficiency (0.0-1.0)
        
    Returns:
        Irrigation requirement (mm/day)
    """
    # Crop evapotranspiration
    etc = et0 * crop_coefficient
    
    # Net irrigation requirement
    net_requirement = max(0, etc - precipitation)
    
    # Gross requirement (accounting for system efficiency)
    gross_requirement = net_requirement / efficiency
    
    return gross_requirement
