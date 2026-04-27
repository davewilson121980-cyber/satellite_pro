import { create } from 'zustand';
import type { AppState, WeatherModel, RadarState } from '../types';

export const useAppStore = create<AppState>((set) => ({
  center: [41.9028, 12.4964],
  zoom: 11,
  activeLayer: 'satellite',
  filterMode: 'none',
  filterIntensity: 0,
  timeOffset: 0,
  isPlaying: false,
  uiExpanded: true,
  weatherModel: 'ICON',
  radarState: 'off',
  coordinates: { lat: 0, lng: 0 },
  setCenter: (c: [number, number]) => set({ center: c }),
  setZoom: (z: number) => set({ zoom: z }),
  setLayer: (l) => set({ activeLayer: l }),
  setFilter: (f) => set({ filterMode: f }),
  setFilterIntensity: (v: number) => set({ filterIntensity: v }),
  setTimeOffset: (t: number) => set({ timeOffset: t }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  toggleUI: () => set((s) => ({ uiExpanded: !s.uiExpanded })),
  setWeatherModel: (m: WeatherModel) => set({ weatherModel: m }),
  setRadarState: (s: RadarState) => set({ radarState: s }),
  setCoordinates: (coords: { lat: number; lng: number }) => set({ coordinates: coords }),
}));
