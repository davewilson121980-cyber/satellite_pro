import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fetchEnvHistory } from '../../api/dataService';
import type { EnvDataPoint } from '../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { saveAs } from 'file-saver';

export const AnalyticsPanel: React.FC = () => {
  const { center } = useAppStore();
  const [data, setData] = useState<EnvDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

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

  const chartData = useMemo(() => data.map(d => ({ time: new Date(d.timestamp).toLocaleDateString('it-IT'), temp: d.temperature, ndvi: d.ndvi })), [data]);

  return (
    <div className="analytics-panel">
      <div className="panel-header">
        <h3>📊 Dati Ambientali</h3>
        <button onClick={exportCSV} disabled={loading}>📥 Esporta</button>
      </div>
      {loading ? <div className="loader">⏳ Caricamento...</div> : (
        <>
          <div className="metrics">
            <div className="metric"><strong>{data[data.length-1]?.temperature.toFixed(1)}°C</strong><span>Temperatura</span></div>
            <div className="metric"><strong>{data[data.length-1]?.humidity.toFixed(0)}%</strong><span>Umidità</span></div>
            <div className="metric"><strong>{data[data.length-1]?.aqi}</strong><span>AQI</span></div>
            <div className="metric"><strong>{(data[data.length-1]?.ndvi * 100).toFixed(0)}%</strong><span>NDVI</span></div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6 }} />
                <Line type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ndvi" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
