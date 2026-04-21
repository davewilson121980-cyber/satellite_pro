import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { FilterMode } from '../../types';

export const TimeSlider: React.FC = () => {
  const { timeOffset, setTimeOffset, isPlaying, togglePlay, setFilter } = useAppStore();
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const newOffset = timeOffset > -7 ? timeOffset - 1 : 0;
        setTimeOffset(newOffset);
        // Cambia il filtro in base al timeOffset
        const filters: FilterMode[] = ['none', 'uv', 'ir', 'ndvi', 'thermal'];
        const index = Math.abs(newOffset) % filters.length;
        setFilter(filters[index]);
      }, 800);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timeOffset, setTimeOffset, setFilter]);

  const handlePlay = () => {
    togglePlay();
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeOffset(parseInt(e.target.value));
  };

  // Calcola il colore del filtro in base al timeOffset
  const getFilterColorForTime = (offset: number) => {
    const filters = ['#94a3b8', '#3b82f6', '#ef4444', '#22c55e', '#f97316'];
    const index = Math.abs(offset) % filters.length;
    return filters[index];
  };

  const currentColor = getFilterColorForTime(timeOffset);

  return (
    <div className="time-slider">
      <span className="time-label" style={{ color: currentColor }}>
        {timeOffset === 0 ? '📅 Oggi' : `⏪ ${Math.abs(timeOffset)} giorni fa`}
      </span>
      <input 
        type="range" 
        min="-7" 
        max="0" 
        step="1" 
        value={timeOffset} 
        onChange={handleTimeChange}
        style={{
          background: `linear-gradient(to right, ${currentColor} 0%, ${currentColor} ${((timeOffset + 7) / 7) * 100}%, var(--bg-tertiary) ${((timeOffset + 7) / 7) * 100}%, var(--bg-tertiary) 100%)`
        }}
      />
      <button onClick={handlePlay} className="play-btn">
        {isPlaying ? '⏸️ Pausa' : '▶️ Play'}
      </button>
    </div>
  );
};
