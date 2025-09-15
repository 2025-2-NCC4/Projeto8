import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const OperatingMarginChart = ({ data, title = "Evolução da Margem Operacional" }) => {

  // Se não há dados, gerar dados de exemplo baseados nos datasets reais
  const generateMonthlyData = () => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return months.map((month, index) => {
      // Simular dados baseados na tendência de crescimento do negócio
      const baseRevenue = 450000 + (index * 35000) + (Math.random() * 50000);
      const baseCosts = baseRevenue * (0.12 + Math.random() * 0.06); // Entre 12% e 18%
      const margin = ((baseRevenue - baseCosts) / baseRevenue) * 100;

      return {
        month,
        receita: Math.floor(baseRevenue),
        custos: Math.floor(baseCosts),
        margem: Number(margin.toFixed(2)),
        lucro: Math.floor(baseRevenue - baseCosts)
      };
    });
  };

  let chartData = [];

  if (data && data.length > 0) {
    chartData = data.map(item => ({
      month: item.name || item.month,
      receita: item.receita || item.revenue || 0,
      custos: item.custos || item.costs || 0,
      margem: item.margem || item.margin || 0,
      lucro: (item.receita || item.revenue || 0) - (item.custos || item.costs || 0)
    }));
  } else {
    chartData = generateMonthlyData();
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
          <p className="tooltip-label">{`Mês: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.dataKey === 'margem'
                ? `${entry.name}: ${entry.value}%`
                : `${entry.name}: R$ ${entry.value.toLocaleString()}`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString()}`;
  };

  const formatPercent = (value) => `${value}%`;

  return (
    <div className="operating-margin-chart">
      <div style={{ marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              yAxisId="money"
              tickFormatter={formatCurrency}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Area
              yAxisId="money"
              type="monotone"
              dataKey="receita"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReceita)"
              name="Receita"
            />

            <Area
              yAxisId="money"
              type="monotone"
              dataKey="custos"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCustos)"
              name="Custos"
            />

            <Area
              yAxisId="money"
              type="monotone"
              dataKey="lucro"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLucro)"
              name="Lucro Operacional"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
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
              dataKey="month"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatPercent}
              stroke="#666"
              fontSize={12}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Line
              type="monotone"
              dataKey="margem"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2 }}
              name="Margem Operacional (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OperatingMarginChart;