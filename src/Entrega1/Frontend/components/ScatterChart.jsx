import React, { useMemo } from 'react';
import { ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const ScatterChart = React.memo(({ data }) => {
  const scatterData = useMemo(() => {
    const generateScatterData = () => {
      return Array.from({ length: 50 }, (_, i) => ({
        x: Math.random() * 100 + 10,
        y: Math.random() * 1000 + 100,
        z: Math.random() * 500 + 50,
        segment: ['Premium', 'Regular', 'Bronze', 'Gold', 'Silver'][Math.floor(Math.random() * 5)]
      }));
    };

    let processedData = [];
    
    if (data && data.length > 0) {
      const limitedData = data.slice(0, 100);
      
      processedData = limitedData.map(item => ({
        x: item.age || Math.random() * 70 + 18,
        y: item.avgTicket || item.valor || Math.random() * 1000 + 100,
        z: Math.random() * 500 + 50,
        segment: item.gender || item.sexo || 'Não informado',
        age: item.age || item.idade,
        avgTicket: item.avgTicket || item.valor
      }));
      
      processedData = processedData.filter(item => item.x > 0 && item.y > 0);
    } else {
      processedData = generateScatterData();
    }
    
    return processedData;
  }, [data]);

  if (!scatterData || scatterData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsScatter margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Idade"
          domain={[15, 80]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Valor Médio"
          domain={['dataMin', 'dataMax']}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => [
            name === 'x' ? `${value.toFixed(0)} anos` : `R$ ${value.toFixed(2)}`,
            name === 'x' ? 'Idade' : 'Valor Médio'
          ]}
          labelFormatter={() => 'Segmento de Cliente'}
        />
        <Scatter 
          name="Segmentos de Clientes" 
          data={scatterData} 
          fill="#8b5cf6"
        />
      </RechartsScatter>
    </ResponsiveContainer>
  );
});

export default ScatterChart;