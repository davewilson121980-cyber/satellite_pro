import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
        setTimeOffset((prev) => (prev > -7 ? prev - 1 : 0));
      }, 1000);
      setIntervalId(id);
    }
  };

  useEffect(() => {
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [intervalId]);

  return (
    <div className="timeline">
      <button onClick={handlePlay} className="play-btn">{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
      <div className="slider-wrap">
        <span>-7d</span>
        <input type="range" min="-7" max="0" step="1" value={timeOffset} onChange={e => setTimeOffset(parseInt(e.target.value))} />
        <span>Oggi</span>
      </div>
      <button onClick={() => setTimeOffset(0)} className="reset-btn"><RotateCcw size={16} /></button>
    </div>
  );
};
