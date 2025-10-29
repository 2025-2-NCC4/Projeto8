import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ROIAnalysisChart = React.memo(({ data }) => {
  const roiData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { tipo: 'Produto', cupons: 156, investimento: 12500, receita: 28400, roi: 127 },
        { tipo: 'Cashback', cupons: 89, investimento: 8900, receita: 15600, roi: 75 },
        { tipo: 'Desconto', cupons: 203, investimento: 15200, receita: 35800, roi: 135 }
      ];
    }

    const roiStats = {};
    
    data.forEach(item => {
      const tipo = item.tipo_cupom || item.ultimo_tipo_cupom || 'Outros';
      const valorCupom = parseFloat(item.valor_cupom) || 0;
      const repasse = parseFloat(item.repasse_picmoney) || valorCupom * 0.1;
      const valorCompra = parseFloat(item.valor_compra) || valorCupom * 3;

      if (!roiStats[tipo]) {
        roiStats[tipo] = {
          tipo,
          cupons: 0,
          investimento: 0,
          receita: 0,
          roi: 0
        };
      }

      roiStats[tipo].cupons += 1;
      roiStats[tipo].investimento += valorCupom;
      roiStats[tipo].receita += valorCompra;
    });

    return Object.values(roiStats).map(stat => ({
      ...stat,
      investimento: Math.round(stat.investimento),
      receita: Math.round(stat.receita),
      roi: stat.investimento > 0 ? Math.round(((stat.receita - stat.investimento) / stat.investimento) * 100) : 0
    })).filter(item => item.cupons > 0);
  }, [data]);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-detail" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('ROI') ? `${entry.value}%` :
                entry.name.includes('Cupons') ? entry.value :
                formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!roiData || roiData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Sem dados de ROI disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={roiData}
        margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="tipo"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="investimento"
          fill="#8b5cf6"
          name="Investimento"
          opacity={0.8}
        />
        <Bar
          yAxisId="left"
          dataKey="receita"
          fill="#a78bfa"
          name="Receita"
          opacity={0.8}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="roi"
          stroke="#7c3aed"
          strokeWidth={3}
          name="ROI (%)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

export default ROIAnalysisChart;