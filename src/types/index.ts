export type LayerID = 'satellite' | 'clouds' | 'temp' | 'wind' | 'precip' | 'ndvi' | 'infrared' | 'uv';
export type FilterMode = 'none' | 'uv' | 'ir' | 'ndvi' | 'thermal';
export type WeatherModel = 'ICON' | 'GFS';
export type RadarState = 'on' | 'off';

export interface EnvDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  aqi: number;
  ndvi: number;
  windSpeed: number;
}

export interface CityLabel {
  name: string;
  lat: number;
  lng: number;
  temp: number;
}

export interface AppState {
  center: [number, number];
  zoom: number;
  activeLayer: LayerID;
  filterMode: FilterMode;
  filterIntensity: number;
  timeOffset: number;
  isPlaying: boolean;
  uiExpanded: boolean;
  weatherModel: WeatherModel;
  radarState: RadarState;
  coordinates: { lat: number; lng: number };
  setCenter: (c: [number, number]) => void;
  setZoom: (z: number) => void;
  setLayer: (l: LayerID) => void;
  setFilter: (f: FilterMode) => void;
  setFilterIntensity: (v: number) => void;
  setTimeOffset: (t: number) => void;
  togglePlay: () => void;
  toggleUI: () => void;
  setWeatherModel: (m: WeatherModel) => void;
  setRadarState: (s: RadarState) => void;
  setCoordinates: (coords: { lat: number; lng: number }) => void;
}
