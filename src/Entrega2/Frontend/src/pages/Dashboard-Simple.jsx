import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = ({ filters, onFiltersChange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 SimpleTest: useEffect disparado');
    
    const fetchData = async () => {
      console.log('🔄 SimpleTest: Iniciando fetch...');
      
      try {
        console.log('🌐 SimpleTest: Chamando API...');
        const stats = await dashboardAPI.getGeneralStats(filters);
        console.log('✅ SimpleTest: Dados recebidos:', stats);
        
        setData(stats);
        setLoading(false);
        console.log('💾 SimpleTest: Loading = false');
        
      } catch (err) {
        console.error('❌ SimpleTest: Erro:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    console.log('🔄 SimpleTest: Renderizando loading...');
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div>Carregando dados simples...</div>
        <div>Loading: {loading.toString()}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px', color: 'red' }}>
        <h2>Erro:</h2>
        <p>{error}</p>
      </div>
    );
  }

  console.log('🎯 SimpleTest: Renderizando dados...');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Simples - FUNCIONANDO!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;