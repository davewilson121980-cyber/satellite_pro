/**
 * Dati meteorologici mockati per simulare eventi atmosferici
 * Genera dati realistici per nuvole, pioggia, temperatura e vento
 */

export interface WeatherDataPoint {
  time: number; // timestamp o indice temporale
  clouds: number; // copertura nuvolosa 0-100%
  rain: number; // intensità pioggia 0-100%
  temp: number; // temperatura in °C
  wind: number; // velocità vento km/h
  windDirection: number; // direzione vento gradi (0-360)
}

export interface WeatherGridPoint {
  x: number;
  y: number;
  clouds: number;
  rain: number;
  temp: number;
  windSpeed: number;
  windDirection: number;
}

/**
 * Genera dati meteorologici mockati per una griglia
 * @param width larghezza della griglia
 * @param height altezza della griglia
 * @param timeIndex indice temporale per l'animazione
 * @returns array di punti della griglia con dati meteo
 */
export const generateWeatherGrid = (
  width: number,
  height: number,
  timeIndex: number
): WeatherGridPoint[] => {
  const grid: WeatherGridPoint[] = [];
  
  // Parametri animati nel tempo per creare variazioni realistiche
  const cloudBase = 30 + Math.sin(timeIndex * 0.1) * 20;
  const rainActive = Math.sin(timeIndex * 0.05) > 0.3;
  const tempBase = 20 + Math.sin(timeIndex * 0.08) * 8;
  const windBase = 15 + Math.cos(timeIndex * 0.12) * 10;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Aggiunge variazioni spaziali usando rumore pseudo-casuale basato su coordinate
      const noise = Math.sin(x * 0.1 + timeIndex * 0.02) * Math.cos(y * 0.1 + timeIndex * 0.03);
      
      grid.push({
        x,
        y,
        clouds: Math.max(0, Math.min(100, cloudBase + noise * 30)),
        rain: rainActive ? Math.max(0, Math.min(100, 40 + noise * 40)) : 0,
        temp: Math.max(-10, Math.min(45, tempBase + noise * 5)),
        windSpeed: Math.max(0, Math.min(100, windBase + noise * 15)),
        windDirection: (timeIndex * 2 + x * 5 + y * 3) % 360
      });
    }
  }
  
  return grid;
};

/**
 * Genera una serie temporale di dati meteorologici per un punto specifico
 * @param timeIndex indice temporale corrente
 * @param duration numero di punti nella serie temporale
 * @returns array di dati temporali
 */
export const generateTimeSeries = (
  timeIndex: number,
  duration: number = 24
): WeatherDataPoint[] => {
  const series: WeatherDataPoint[] = [];
  
  for (let i = 0; i < duration; i++) {
    const t = timeIndex - duration + i;
    series.push({
      time: t,
      clouds: 30 + Math.sin(t * 0.1) * 20 + Math.random() * 10,
      rain: Math.max(0, Math.sin(t * 0.05) * 50 + Math.random() * 20),
      temp: 20 + Math.sin(t * 0.08) * 8 + Math.random() * 2,
      wind: 15 + Math.cos(t * 0.12) * 10 + Math.random() * 5,
      windDirection: (t * 5) % 360
    });
  }
  
  return series;
};

/**
 * Ottiene dati aggregati per il layer specificato
 * @param layer tipo di layer ('clouds', 'rain', 'temp', 'wind')
 * @param timeIndex indice temporale
 * @returns valore medio del parametro per il layer
 */
export const getLayerValue = (layer: string, timeIndex: number): number => {
  switch (layer) {
    case 'clouds':
      return 30 + Math.sin(timeIndex * 0.1) * 20;
    case 'rain':
      return Math.max(0, Math.sin(timeIndex * 0.05) * 50);
    case 'temp':
      return 20 + Math.sin(timeIndex * 0.08) * 8;
    case 'wind':
      return 15 + Math.cos(timeIndex * 0.12) * 10;
    default:
      return 0;
  }
};
