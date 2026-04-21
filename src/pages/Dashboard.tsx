import React from 'react';
import { ProfessionalMap } from '../components/Map/ProfessionalMap';
import { ControlPanel } from '../components/UI/ControlPanel';
import { TimeSlider } from '../components/UI/TimeSlider';
import { AnalyticsPanel } from '../components/Dashboard/AnalyticsPanel';
import { useAuthStore } from '../store/useAuthStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  return (
    <div className="dashboard-wrapper">
      <div className="dash-header glass">
        <h2>🛰️ Dashboard di Analisi</h2>
        <span className="user-tag">Utente: {user?.name} | Piano: {user?.tier}</span>
      </div>
      <div className="map-layout">
        <ProfessionalMap />
        <aside className="side-panels">
          <ControlPanel />
          <AnalyticsPanel />
        </aside>
      </div>
      <TimeSlider />
    </div>
  );
};
