import React from 'react';
import { motion } from 'framer-motion';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  AreaChart
} from 'recharts';

const COLORS = ['#FFC107', '#4CAF50', '#0D47A1', '#FFD54F', '#66BB6A', '#1565C0'];

const CustomTooltip = ({ active, payload, label, labelFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="custom-tooltip"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="tooltip-header">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
        <div className="tooltip-content">
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div 
                className="tooltip-color" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-value">
                {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

const ChartContainer = ({ 
  title, 
  subtitle, 
  children, 
  loading = false, 
  error = null,
  className = "",
}) => {


  return (
    <motion.div
      className={`chart-container ${className}`}
      whileHover={{ 
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: { duration: 0.3 }
      }}
    >
      {(title || subtitle) && (
        <div className="chart-header">
          <div className="chart-title-section">
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="chart-content">
        {children}
      </div>
    </motion.div>
  );
};


export const DualAxisChart = ({ data, loading, className }) => {
  const formatCurrency = (value) => `R$ ${value?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`;
  const formatNumber = (value) => value?.toLocaleString('pt-BR') || '0';

  const chartData = data?.map(item => ({
    ...item,

    data: new Date(item.data).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: '2-digit'
    })
  })) || [];

  return (
    <ChartContainer
      title="Evolução da Receita vs. Usuários Ativos"
      subtitle="Análise de correlação mensal para insights estratégicos"
      loading={loading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="data" 
            stroke="var(--text-secondary-color)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="revenue"
            orientation="left"
            stroke="#4CAF50"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <YAxis 
            yAxisId="users"
            orientation="right"
            stroke="#0D47A1"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
          />
          <Tooltip 
            content={<CustomTooltip 
              labelFormatter={(label) => `Mês: ${label}`}
            />}
            position={{ x: 'center', y: 'top' }}
            allowEscapeViewBox={{ x: true, y: true }}
            offset={10}
          />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Bar 
            yAxisId="revenue"
            dataKey="receita_picmoney" 
            name="Receita PicMoney"
            fill="url(#revenueGradient)"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="users"
            type="monotone"
            dataKey="usuarios_ativos"
            name="Usuários Ativos"
            stroke="#0D47A1"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};


export const CategoryChart = ({ data, title, loading, className }) => {
  const formatCurrency = (value) => `R$ ${Math.round(value/1000)}k`;
  
  return (
    <ChartContainer
      title={title}
      subtitle="Top 5 categorias por receita gerada"
      loading={loading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data?.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false}/>
          <XAxis 
            type="number"
            stroke="var(--text-secondary-color)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <YAxis 
            type="category"
            dataKey="categoria" 
            width={80}
            stroke="var(--text-secondary-color)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Receita']}
            content={<CustomTooltip />}
          />
          <Bar 
            dataKey="valor" 
            name="Receita"
            fill="#4CAF50"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};


export const DistributionChart = ({ data, title, dataKey, nameKey = "tipo", loading, className }) => {
  const formatValue = (value) => {
    if (dataKey === 'valor' || dataKey === 'revenue') {
      return `R$ ${value?.toLocaleString('pt-BR') || '0'}`;
    }
    return value?.toLocaleString('pt-BR') || '0';
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer
      title={title}
      subtitle={`Distribuição de ${data?.length} tipos de cupons`}
      loading={loading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={40}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            paddingAngle={2}
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [formatValue(value), name]}
            content={<CustomTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {data?.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
            <span className="legend-label">{item[nameKey]}</span>
            <span className="legend-value">{formatValue(item[dataKey])}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};
