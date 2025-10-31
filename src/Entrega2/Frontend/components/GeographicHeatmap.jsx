import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const HEAT_COLORS = [
  '#8b5cf6', '#7c3aed', '#6d28d9',
  '#06b6d4', '#0891b2', '#0e7490',
  '#10b981', '#059669', '#047857',
  '#f59e0b', '#d97706', '#b45309'
];

const GeographicHeatmap = React.memo(({ data }) => {
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 50 }, (_, i) => ({
        x: -23.55 + Math.random() * 0.03,
        y: -46.63 + Math.random() * 0.03,
        intensity: Math.random() * 100,
        transactions: Math.floor(Math.random() * 50) + 1,
        revenue: Math.random() * 10000 + 1000
      }));
    }

    const processedData = data.slice(0, 200).map(item => ({
      x: parseFloat(item.latitude) || -23.55 + Math.random() * 0.03,
      y: parseFloat(item.longitude) || -46.63 + Math.random() * 0.03,
      intensity: parseFloat(item.valor_compra) || parseFloat(item.valor_cupom) || Math.random() * 100,
      transactions: 1,
      revenue: parseFloat(item.valor_compra) || parseFloat(item.valor_cupom) || 0,
      local: item.local_captura || item.nome_estabelecimento || 'Local'
    }));

    const locationMap = {};
    processedData.forEach(point => {
      const key = `${point.x.toFixed(4)},${point.y.toFixed(4)}`;
      if (locationMap[key]) {
        locationMap[key].transactions += 1;
        locationMap[key].revenue += point.revenue;
        locationMap[key].intensity = (locationMap[key].intensity + point.intensity) / 2;
      } else {
        locationMap[key] = { ...point };
      }
    });

    return Object.values(locationMap).filter(point => 
      point.x > -24 && point.x < -23 && point.y > -47 && point.y < -46
    );
  }, [data]);

  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados geográficos disponíveis</p>
      </div>
    );
  }

  const maxIntensity = Math.max(...heatmapData.map(d => d.intensity));
  const minIntensity = Math.min(...heatmapData.map(d => d.intensity));

  const getHeatColor = (intensity) => {
    const normalizedIntensity = (intensity - minIntensity) / (maxIntensity - minIntensity);
    const colorIndex = Math.floor(normalizedIntensity * (HEAT_COLORS.length - 1));
    return HEAT_COLORS[Math.min(colorIndex, HEAT_COLORS.length - 1)];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{data.local}</p>
          <p className="tooltip-detail">Transações: {data.transactions}</p>
          <p className="tooltip-detail">Receita: R$ {data.revenue.toFixed(2)}</p>
          <p className="tooltip-detail">Intensidade: {data.intensity.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        data={heatmapData}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          type="number"
          dataKey="x"
          name="Latitude"
          domain={['dataMin - 0.01', 'dataMax + 0.01']}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Longitude"
          domain={['dataMin - 0.01', 'dataMax + 0.01']}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter name="Hotspots" data={heatmapData}>
          {heatmapData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={getHeatColor(entry.intensity)}
              opacity={0.7}
              r={Math.max(4, Math.min(12, entry.transactions * 2))}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
});

export default GeographicHeatmap;