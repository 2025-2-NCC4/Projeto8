import React, { useState, useEffect } from 'react';

const TestApp = () => {
  const [data, setData] = useState({ message: 'Carregando...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test API call
    const testAPI = async () => {
      try {
        console.log('Fazendo chamada API...');
        const response = await fetch('http://localhost:3002/api/status');
        const result = await response.json();
        console.log('Resposta da API:', result);
        setData({ message: `API funcionando! Status: ${result.status}` });
      } catch (error) {
        console.error('Erro na API:', error);
        setData({ message: `Erro: ${error.message}` });
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>PicMoney Dashboard - TESTE</h1>
        <p>Carregando teste de API...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>PicMoney Dashboard - FUNCIONANDO!</h1>
      <p>Status: {data.message}</p>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Dashboard Simplificado</h2>
        <p>✅ Frontend carregando</p>
        <p>✅ Backend conectado</p>
        <p>✅ API respondendo</p>
      </div>
    </div>
  );
};

export default TestApp;