import React, { useState } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/dateUtils';

const PieChart = ({ data, title = "Distribuição por Tipo de Cupom", dataKey = "valor" }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const COLORS = [
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
    '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#581c87',
    '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${data.nome || data.tipo || label}`}</p>
          <p className="tooltip-value" style={{ color: payload[0].color }}>
            {`Valor: ${formatCurrency(data.valor)}`}
          </p>
          <p className="tooltip-value">
            {`Quantidade: ${formatNumber(data.quantidade || 0)}`}
          </p>
          <p className="tooltip-percentage">
            {`Percentual: ${data.percentual?.toFixed(1) || 0}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent < 0.05) return null; 
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const totalValue = data?.reduce((sum, item) => sum + (item[dataKey] || item.valor || 0), 0) || 0;
  const processedData = data?.map((item, index) => ({
    ...item,
    percentual: totalValue > 0 ? ((item[dataKey] || item.valor || 0) / totalValue) * 100 : 0,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="pie-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsPieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey={dataKey || "valor"}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={activeIndex === index ? "#333" : "none"}
                strokeWidth={activeIndex === index ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {entry.payload.nome || entry.payload.tipo || value}
              </span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      {processedData && processedData.length > 0 && (
        <div className="chart-details">
          <h4>Detalhamento</h4>
          <div className="details-list">
            {processedData
              .sort((a, b) => (b[dataKey] || b.valor) - (a[dataKey] || a.valor))
              .map((item, index) => (
                <div key={index} className="detail-item">
                  <div 
                    className="detail-color" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="detail-content">
                    <div className="detail-name">
                      {item.nome || item.tipo || `Item ${index + 1}`}
                    </div>
                    <div className="detail-stats">
                      <span className="detail-value">
                        {formatCurrency(item[dataKey] || item.valor)}
                      </span>
                      <span className="detail-percentage">
                        ({item.percentual?.toFixed(1) || 0}%)
                      </span>
                    </div>
                    {item.quantidade && (
                      <div className="detail-quantity">
                        {formatNumber(item.quantidade)} transações
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
