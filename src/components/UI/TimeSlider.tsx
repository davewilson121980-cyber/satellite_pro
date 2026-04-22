import React from 'react';

interface TimeSliderProps {
  currentIndex: number;
  isPlaying: boolean;
  onSlide: (index: number) => void;
  onTogglePlay: () => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  currentIndex,
  isPlaying,
  onSlide,
  onTogglePlay
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="time-slider-container glass p-4 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-mono text-lg">
          Ore: {currentIndex.toString().padStart(2, '0')}:00
        </span>
        <button
          onClick={onTogglePlay}
          className={`px-4 py-1 rounded-full font-bold ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isPlaying ? '⏸ Pausa' : '▶ Play'}
        </button>
      </div>
      
      <input
        type="range"
        min="0"
        max="23"
        step="1"
        value={currentIndex}
        onChange={(e) => onSlide(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      
      <div className="flex justify-between mt-1 text-xs text-gray-400 font-mono">
        {hours.filter((_, i) => i % 4 === 0).map(h => (
          <span key={h}>{h}:00</span>
        ))}
      </div>
    </div>
  );
};