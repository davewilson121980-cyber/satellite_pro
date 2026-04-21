export type LayerID = 'satellite' | 'clouds' | 'temp' | 'wind' | 'precip';
export type FilterMode = 'none' | 'uv' | 'ir' | 'ndvi' | 'thermal';

export interface EnvDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  aqi: number;
  ndvi: number;
  windSpeed: number;
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
  setCenter: (c: [number, number]) => void;
  setZoom: (z: number) => void;
  setLayer: (l: LayerID) => void;
  setFilter: (f: FilterMode) => void;
  setFilterIntensity: (v: number) => void;
  setTimeOffset: (t: number) => void;
  togglePlay: () => void;
  toggleUI: () => void;
}
