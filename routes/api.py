"""
API routes - Endpoints for data fetching and analysis.
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from extensions import db
from models import DataLog
from services import DataFetcher, calculate_solar_power, calculate_wind_power
from config import Config

api_bp = Blueprint('api', __name__)


@api_bp.route('/weather', methods=['GET'])
@login_required
def get_weather():
    """Fetch weather data for specified location and date range."""
    # Get parameters
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    start = request.args.get('start', default=(datetime.utcnow() - timedelta(days=30)).strftime('%Y%m%d'))
    end = request.args.get('end', default=datetime.utcnow().strftime('%Y%m%d'))
    
    # Validate coordinates
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Check user's query limit
    plan = Config.SUBSCRIPTION_PLANS.get(current_user.subscription_plan, {})
    limit = plan.get('limitations', {}).get('daily_queries', 10)
    
    if not current_user.can_make_query(limit):
        return jsonify({'error': 'Daily query limit reached. Please upgrade your plan.'}), 429
    
    try:
        # Fetch data
        fetcher = DataFetcher()
        data = fetcher.get_weather_data(lat, lng, start, end)
        
        # Log the request
        log = DataLog(
            user_id=current_user.id,
            latitude=lat,
            longitude=lng,
            parameter_type='weather',
            api_source='NASA_POWER',
            status_code=200
        )
        db.session.add(log)
        
        # Increment query count
        current_user.increment_query_count()
        db.session.commit()
        
        return jsonify(data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/solar', methods=['GET'])
@login_required
def get_solar():
    """Fetch solar radiation data and estimate energy production."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    start = request.args.get('start', default=(datetime.utcnow() - timedelta(days=30)).strftime('%Y%m%d'))
    end = request.args.get('end', default=datetime.utcnow().strftime('%Y%m%d'))
    panel_area = request.args.get('area', default=20, type=float)  # m²
    efficiency = request.args.get('efficiency', default=0.20, type=float)
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Check query limit
    plan = Config.SUBSCRIPTION_PLANS.get(current_user.subscription_plan, {})
    limit = plan.get('limitations', {}).get('daily_queries', 10)
    
    if not current_user.can_make_query(limit):
        return jsonify({'error': 'Daily query limit reached'}), 429
    
    try:
        fetcher = DataFetcher()
        solar_data = fetcher.get_solar_data(lat, lng, start, end)
        
        # Calculate energy production estimates
        if 'time_series' in solar_data and 'ALLSKY_SFC_SW_DWN' in solar_data['time_series']:
            ghi_values = solar_data['time_series']['ALLSKY_SFC_SW_DWN']['values']
            
            # Calculate daily production for each day
            production_estimates = []
            for ghi in ghi_values:
                if ghi is not None:
                    daily_production = calculate_solar_power(ghi, panel_area, efficiency)
                    production_estimates.append(daily_production)
            
            solar_data['energy_estimates'] = {
                'panel_area': panel_area,
                'efficiency': efficiency,
                'daily_production_kwh': production_estimates,
                'average_daily_kwh': sum(production_estimates) / len(production_estimates) if production_estimates else 0
            }
        
        # Log request
        log = DataLog(
            user_id=current_user.id,
            latitude=lat,
            longitude=lng,
            parameter_type='solar',
            api_source='NASA_POWER'
        )
        db.session.add(log)
        current_user.increment_query_count()
        db.session.commit()
        
        return jsonify(solar_data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/wind', methods=['GET'])
@login_required
def get_wind():
    """Fetch wind data and estimate energy production."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    start = request.args.get('start', default=(datetime.utcnow() - timedelta(days=30)).strftime('%Y%m%d'))
    end = request.args.get('end', default=datetime.utcnow().strftime('%Y%m%d'))
    rotor_diameter = request.args.get('rotor', default=80, type=float)  # meters
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Check if user has access to wind data (Premium+)
    if current_user.subscription_plan == 'free':
        return jsonify({'error': 'Wind energy analysis requires Premium or Enterprise plan'}), 403
    
    try:
        fetcher = DataFetcher()
        wind_data = fetcher.get_wind_data(lat, lng, start, end)
        
        # Calculate energy production estimates
        if 'time_series' in wind_data:
            production_estimates = []
            
            for param_name, param_data in wind_data['time_series'].items():
                if param_name.startswith('WIND'):
                    height = int(param_name.replace('WIND', '').replace('M', ''))
                    
                    # Adjust to typical turbine hub height (80-100m)
                    adjusted_speeds = []
                    for speed in param_data['values']:
                        if speed is not None:
                            # Adjust to 80m hub height
                            adjusted = calculate_wind_power(speed, rotor_diameter)
                            adjusted_speeds.append(adjusted)
                    
                    production_estimates.append({
                        'height': height,
                        'power_watts': adjusted_speeds,
                        'average_kw': sum(adjusted_speeds) / len(adjusted_speeds) / 1000 if adjusted_speeds else 0
                    })
            
            wind_data['energy_estimates'] = {
                'rotor_diameter': rotor_diameter,
                'hub_height': 80,
                'production_by_height': production_estimates
            }
        
        # Log request
        log = DataLog(
            user_id=current_user.id,
            latitude=lat,
            longitude=lng,
            parameter_type='wind',
            api_source='NASA_POWER'
        )
        db.session.add(log)
        current_user.increment_query_count()
        db.session.commit()
        
        return jsonify(wind_data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ndvi', methods=['GET'])
@login_required
def get_ndvi():
    """Fetch NDVI vegetation index data."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    start = request.args.get('start', default=(datetime.utcnow() - timedelta(days=90)).strftime('%Y%m%d'))
    end = request.args.get('end', default=datetime.utcnow().strftime('%Y%m%d'))
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    # Check if user has access to NDVI data (Premium+)
    if current_user.subscription_plan == 'free':
        return jsonify({'error': 'NDVI analysis requires Premium or Enterprise plan'}), 403
    
    try:
        fetcher = DataFetcher()
        ndvi_data = fetcher.get_ndvi_data(lat, lng, start, end)
        
        # Log request
        log = DataLog(
            user_id=current_user.id,
            latitude=lat,
            longitude=lng,
            parameter_type='ndvi',
            api_source='SENTINEL_HUB'
        )
        db.session.add(log)
        current_user.increment_query_count()
        db.session.commit()
        
        return jsonify(ndvi_data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/agricultural', methods=['GET'])
@login_required
def get_agricultural():
    """Fetch agricultural parameters (evapotranspiration, precipitation, etc.)."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    start = request.args.get('start', default=(datetime.utcnow() - timedelta(days=30)).strftime('%Y%m%d'))
    end = request.args.get('end', default=datetime.utcnow().strftime('%Y%m%d'))
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude are required'}), 400
    
    try:
        fetcher = DataFetcher()
        agri_data = fetcher.get_agricultural_data(lat, lng, start, end)
        
        # Log request
        log = DataLog(
            user_id=current_user.id,
            latitude=lat,
            longitude=lng,
            parameter_type='agricultural',
            api_source='NASA_POWER'
        )
        db.session.add(log)
        current_user.increment_query_count()
        db.session.commit()
        
        return jsonify(agri_data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/usage', methods=['GET'])
@login_required
def get_usage():
    """Get current user's API usage statistics."""
    plan = Config.SUBSCRIPTION_PLANS.get(current_user.subscription_plan, {})
    limit = plan.get('limitations', {}).get('daily_queries', 10)
    
    return jsonify({
        'subscription_plan': current_user.subscription_plan,
        'queries_today': current_user.queries_today,
        'daily_limit': limit if limit > 0 else 'unlimited',
        'can_make_query': current_user.can_make_query(limit)
    })
