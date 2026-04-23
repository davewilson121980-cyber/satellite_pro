import axios from 'axios';
import type { EnvDataPoint, LayerID } from '../types';

export const getTileSource = (layer: LayerID): string => {
  const sources: Record<LayerID, string> = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    clouds: 'https://tile.openweathermap.org/map/clouds_new/{z}/{y}/{x}.png?appid=demo',
    temp: 'https://tile.openweathermap.org/map/temp_new/{z}/{y}/{x}.png?appid=demo',
    wind: 'https://tile.openweathermap.org/map/wind_new/{z}/{y}/{x}.png?appid=demo',
    precip: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{y}/{x}.png?appid=demo'
  };
  return sources[layer];
};

export const fetchEnvHistory = async (lat: number, lon: number, days: number = 7): Promise<EnvDataPoint[]> => {
  const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat, longitude: lon,
      hourly: 'temperature_2m,relativehumidity_2m,windspeed_10m',
      past_days: days, forecast_days: 1
    }
  });
  return res.data.hourly.time.map((t: string, i: number) => ({
    timestamp: t,
    temperature: res.data.hourly.temperature_2m[i] ?? 20,
    humidity: res.data.hourly.relativehumidity_2m[i] ?? 50,
    windSpeed: res.data.hourly.windspeed_10m[i] ?? 5,
    aqi: Math.round(40 + Math.sin(i * 0.4) * 30 + Math.random() * 10),
    ndvi: Math.max(0, Math.min(1, 0.35 + Math.cos(i * 0.6) * 0.45))
  }));
};
