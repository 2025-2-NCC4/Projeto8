import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import './App.css';

const App = () => {
  const [filters, setFilters] = useState({
    startDate: '2025-07-01',
    endDate: '2025-08-01',
    categoria: '',
    bairro: '',
    tipoCupom: '',
    ageRange: '',
    gender: '',
    deviceType: '',
    minValue: '',
    maxValue: ''
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="app-container">
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <Dashboard filters={filters} onFiltersChange={handleFiltersChange} />
        </main>
      </div>
    </div>
  );
};

export default App;