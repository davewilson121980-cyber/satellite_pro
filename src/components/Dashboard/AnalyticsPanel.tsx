import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fetchEnvHistory } from '../../api/dataService';
import type { EnvDataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';
import { saveAs } from 'file-saver';

interface AnalyticsPanelProps {
  timeIndex: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ timeIndex }) => {
  const { center } = useAppStore();
  const [data, setData] = useState<EnvDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Utilizza timeIndex per simulare dati meteo in tempo reale
  // Il parametro è disponibile per future implementazioni di animazione temporale
  useEffect(() => {
    // Qui si potrebbe integrare la logica per aggiornare i dati in base al timeIndex
    // Per ora viene usato solo come placeholder per l'interfaccia
    console.log('TimeIndex aggiornato:', timeIndex);
  }, [timeIndex]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchEnvHistory(center[0], center[1], 7);
        if (!cancelled) setData(res);
      } catch (e) { console.error(e); } finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [center]);

  const exportCSV = () => {
    const csv = `timestamp,temp,humidity,aqi,ndvi,wind\n${data.map(d => `${d.timestamp},${d.temperature},${d.humidity},${d.aqi},${d.ndvi},${d.windSpeed}`).join('\n')}`;
    saveAs(new Blob([csv], { type: 'text/csv' }), 'analytics_export.csv');
  };

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const temps = data.map(d => d.temperature);
    const humid = data.map(d => d.humidity);
    const aqis = data.map(d => d.aqi);
    const ndvis = data.map(d => d.ndvi);
    return {
      tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      humidAvg: humid.reduce((a, b) => a + b, 0) / humid.length,
      aqiAvg: aqis.reduce((a, b) => a + b, 0) / aqis.length,
      aqiMax: Math.max(...aqis),
      ndviAvg: ndvis.reduce((a, b) => a + b, 0) / ndvis.length,
      ndviTrend: ndvis[ndvis.length - 1] - ndvis[0]
    };
  }, [data]);

  const chartData = useMemo(() => data.map(d => ({ 
    time: new Date(d.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }), 
    temp: d.temperature, 
    ndvi: d.ndvi * 100,
    humidity: d.humidity,
    aqi: d.aqi 
  })), [data]);

  const getAQIColor = (aqi: number) => {
    if (aqi < 50) return '#22c55e';
    if (aqi < 100) return '#84cc16';
    if (aqi < 150) return '#f59e0b';
    if (aqi < 200) return '#f97316';
    return '#ef4444';
  };

  const getNDVIColor = (ndvi: number) => {
    if (ndvi < 0.2) return '#a855f7';
    if (ndvi < 0.4) return '#eab308';
    if (ndvi < 0.6) return '#84cc16';
    return '#22c55e';
  };

  return (
    <div className="analytics-panel">
      <div className="panel-header">
        <h3>📊 Dati Ambientali</h3>
        <button onClick={exportCSV} disabled={loading}>📥 Esporta</button>
      </div>
      {loading ? <div className="loader">⏳ Caricamento...</div> : (
        <>
          <div className="metrics">
            <div className="metric">
              <strong style={{ color: '#38bdf8' }}>{data[data.length-1]?.temperature.toFixed(1)}°C</strong>
              <span>Temperatura</span>
            </div>
            <div className="metric">
              <strong style={{ color: '#22c55e' }}>{data[data.length-1]?.humidity.toFixed(0)}%</strong>
              <span>Umidità</span>
            </div>
            <div className="metric">
              <strong style={{ color: getAQIColor(data[data.length-1]?.aqi || 50) }}>{data[data.length-1]?.aqi}</strong>
              <span>AQI</span>
            </div>
            <div className="metric">
              <strong style={{ color: getNDVIColor(data[data.length-1]?.ndvi || 0.3) }}>{(data[data.length-1]?.ndvi * 100).toFixed(0)}%</strong>
              <span>NDVI</span>
            </div>
          </div>
          
          {stats && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Temp Media</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.tempAvg.toFixed(1)}°C</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Range Temp</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.tempMin.toFixed(0)}° - {stats.tempMax.toFixed(0)}°</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>AQI Max</div>
                <div style={{ color: getAQIColor(stats.aqiMax), fontWeight: 600 }}>{stats.aqiMax}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.7rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Trend NDVI</div>
                <div style={{ color: stats.ndviTrend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {stats.ndviTrend >= 0 ? '↗' : '↘'} {Math.abs(stats.ndviTrend * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="°C" />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                />
                <Area type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2} fill="url(#tempGradient)" name="Temperatura" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrap" style={{ marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }}
                />
                <Bar dataKey="ndvi" fill="#22c55e" radius={[4, 4, 0, 0]} name="NDVI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrap" style={{ marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 200]} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }}
                />
                <Line type="monotone" dataKey="aqi" stroke={getAQIColor(stats?.aqiAvg || 50)} strokeWidth={2} dot={false} name="AQI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
