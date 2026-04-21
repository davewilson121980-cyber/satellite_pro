import { create } from 'zustand';
import type { AppState } from '../types';

export const useAppStore = create<AppState>((set) => ({
  center: [41.9028, 12.4964],
  zoom: 11,
  activeLayer: 'satellite',
  filterMode: 'none',
  filterIntensity: 0,
  timeOffset: 0,
  isPlaying: false,
  uiExpanded: true,
  setCenter: (c) => set({ center: c }),
  setZoom: (z) => set({ zoom: z }),
  setLayer: (l) => set({ activeLayer: l }),
  setFilter: (f) => set({ filterMode: f }),
  setFilterIntensity: (v) => set({ filterIntensity: v }),
  setTimeOffset: (t) => set({ timeOffset: t }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  toggleUI: () => set((s) => ({ uiExpanded: !s.uiExpanded })),
}));
