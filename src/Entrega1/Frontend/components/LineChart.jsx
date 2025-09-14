import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatDate, formatCurrency } from '../utils/dateUtils';

const LineChart = ({ data, title = "Evolução das Transações" }) => {
  
  const generateSampleData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const baseValue = 50000 + Math.random() * 30000;
      const quantity = 200 + Math.random() * 150;
      
      days.push({
        data: date.toISOString().split('T')[0],
        date: date.toISOString().split('T')[0],
        valor_total: Math.floor(baseValue + (Math.sin(i * 0.2) * 10000)),
        quantidade: Math.floor(quantity + (Math.sin(i * 0.3) * 50)),
        repasse_picmoney: Math.floor((baseValue * 0.15) + (Math.random() * 5000))
      });
    }
    
    return days;
  };
  
  let chartData = [];
  
  if (data && data.length > 0) {
    chartData = data.map(item => ({
      data: item.data || item.date,
      date: item.data || item.date,
      valor_total: item.valor || item.valor_total || item.revenue || 0,
      quantidade: item.transacoes || item.quantidade || item.count || 0,
      repasse_picmoney: (item.valor || item.valor_total || 0) * 0.15
    }));
    
    chartData.sort((a, b) => new Date(a.data) - new Date(b.data));
  } else {
    chartData = generateSampleData();
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados disponíveis para o período selecionado</p>
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">
            {`Data: ${formatDate(label)}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.dataKey === 'valor' || entry.dataKey === 'receita' 
                  ? formatCurrency(entry.value)
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  const formatXAxis = (tickItem) => {
    return formatDate(tickItem, 'dd/MM');
  };

  return (
    <div className="line-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsLineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="data" 
            tickFormatter={formatXAxis}
            stroke="#666"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={formatYAxis}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#06b6d4"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            type="monotone"
            dataKey="valor_total"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
            name="Valor Total (R$)"
            yAxisId="left"
          />
          
          <Line
            type="monotone"
            dataKey="quantidade"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, stroke: '#06b6d4', strokeWidth: 2 }}
            name="Quantidade de Transações"
            yAxisId="right"
          />
          
          <Line
            type="monotone"
            dataKey="repasse_picmoney"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
            name="Repasse PicMoney (R$)"
            yAxisId="left"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
