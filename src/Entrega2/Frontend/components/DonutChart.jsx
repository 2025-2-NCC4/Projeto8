import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed', '#6d28d9', '#5b21b6', '#06b6d4', '#0891b2', '#0e7490'];

const DonutChart = ({ data, dataKey = 'value' }) => {
  const sampleData = [
    { name: 'Pinheiros', value: 450000, revenue: 450000 },
    { name: 'Vila Madalena', value: 320000, revenue: 320000 },
    { name: 'Itaim Bibi', value: 280000, revenue: 280000 },
    { name: 'Moema', value: 220000, revenue: 220000 },
    { name: 'Vila Olímpia', value: 180000, revenue: 180000 },
    { name: 'Brooklin', value: 150000, revenue: 150000 },
    { name: 'Outros Bairros', value: 200000, revenue: 200000 }
  ];
  
  let chartData = data && data.length > 0 ? data : sampleData;
  
  if (data && data.length > 0) {
    chartData = data.map(item => ({
      name: item.name || item.region || item.bairro || 'Sem nome',
      value: item.revenue || item.value || item.total || 0,
      revenue: item.revenue || item.value || item.total || 0
    }));
    
    chartData = chartData.slice(0, 10);
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Erro ao carregar dados do gráfico</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => percent > 0.05 ? `${name}` : null}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Receita']}
          contentStyle={{
            backgroundColor: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;