import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const TimeSlider: React.FC = () => {
  const { timeOffset, setTimeOffset, isPlaying, togglePlay } = useAppStore();
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  const handlePlay = () => {
    if (isPlaying) {
      if (intervalId) clearInterval(intervalId);
      togglePlay();
    } else {
      togglePlay();
      const id = window.setInterval(() => {
        setTimeOffset(timeOffset > -7 ? timeOffset - 1 : 0);
      }, 1000);
      setIntervalId(id);
    }
  };

  useEffect(() => {
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [intervalId]);

  return (
    <div className="time-slider">
      <span className="time-label">{timeOffset === 0 ? 'Oggi' : `${Math.abs(timeOffset)} giorni fa`}</span>
      <input type="range" min="-7" max="0" step="1" value={timeOffset} onChange={e => setTimeOffset(parseInt(e.target.value))} />
      <button onClick={handlePlay} className="play-btn">{isPlaying ? '⏸️' : '▶️'}</button>
    </div>
  );
};
