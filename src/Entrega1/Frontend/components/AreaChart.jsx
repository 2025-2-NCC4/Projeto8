import React from 'react';
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data }) => {
  const generateSampleData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, index) => ({
      date: month,
      valor: Math.floor(Math.random() * 50000) + 20000 + (index * 1000),
      crescimento: Math.floor(Math.random() * 30) + 10
    }));
  };
  
  let chartData = [];
  
  if (data && data.length > 0) {
    const sortedData = [...data].sort((a, b) => new Date(a.data || a.date) - new Date(b.data || b.date));
    
    chartData = sortedData.map((item, index) => {
      const valor = item.valor || item.valor_total || 0;
      const previousValor = index > 0 ? (sortedData[index - 1].valor || sortedData[index - 1].valor_total || 0) : valor;
      const crescimento = previousValor > 0 ? ((valor - previousValor) / previousValor) * 100 : 0;
      
      return {
        date: item.data || item.date,
        valor: valor,
        crescimento: Math.max(-50, Math.min(50, crescimento))
      };
    });
  } else {
    chartData = generateSampleData();
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsArea
        data={chartData}
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            if (value && value.includes('-')) {
              const date = new Date(value);
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }
            return value;
          }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <Tooltip 
          formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']}
          labelFormatter={(label) => `Período: ${label}`}
          contentStyle={{
            backgroundColor: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px'
          }}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#8b5cf6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorGrowth)"
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
};

export default AreaChart;