import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/dateUtils';

const BarChart = ({ data, title = "Top Categorias por Valor" }) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">
            {`${label}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.dataKey === 'valor' || entry.dataKey === 'valor_total' 
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)
              }`}
            </p>
          ))}
          {payload.length > 0 && payload[0].payload.percentual && (
            <p className="tooltip-percentage">
              {`${payload[0].payload.percentual}% do total`}
            </p>
          )}
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
    return `R$ ${value}`;
  };

  const formatXAxisLabel = (value) => {
    if (value && value.length > 15) {
      return value.substring(0, 15) + '...';
    }
    return value;
  };

  const getBarColor = (index) => {
    const colors = [
      '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed',
      '#6d28d9', '#5b21b6', '#4c1d95', '#06b6d4', '#0891b2'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bar-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="categoria" 
            tickFormatter={formatXAxisLabel}
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
            stroke="#dc2626"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar
            dataKey="valor"
            name="Valor Total"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            yAxisId="left"
          />
          
          <Bar
            dataKey="transacoes"
            name="Nº de Transações"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            yAxisId="right"
          />
        </RechartsBarChart>
      </ResponsiveContainer>

      {data && data.length > 0 && (
        <div className="chart-summary">
          <h4>Top 5 Categorias</h4>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Transações</th>
                <th>% Total</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}º</td>
                  <td title={item.categoria}>{formatXAxisLabel(item.categoria)}</td>
                  <td>{formatCurrency(item.valor)}</td>
                  <td>{formatNumber(item.transacoes)}</td>
                  <td>{item.percentual || '-'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarChart;
