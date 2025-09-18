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
  AreaChart,
  LineChart,
  Area
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
                {entry.value !== null && entry.value !== undefined
                  ? (typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value)
                  : '0'
                }
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

  console.log('DualAxisChart recebeu dados:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('DualAxisChart: dados vazios ou inválidos');
    return (
      <ChartContainer
        title="Evolução da Receita vs. Usuários Ativos"
        subtitle="Análise de correlação diária para insights estratégicos"
        loading={loading}
        className={className}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '380px',
          color: '#64748b'
        }}>
          <p>Nenhum dado disponível para exibir</p>
        </div>
      </ChartContainer>
    );
  }

  const chartData = data.map(item => {
    let formattedDate = item.data;

    // Se a data estiver no formato YYYY-MM, adicionar dia
    if (item.data && typeof item.data === 'string' && item.data.match(/^\d{4}-\d{2}$/)) {
      formattedDate = `${item.data}-01`;
    }

    try {
      // Fix timezone issue: add 'T12:00:00' to avoid UTC conversion problems
      const dateWithTime = formattedDate.includes('T') ? formattedDate : `${formattedDate}T12:00:00`;
      const date = new Date(dateWithTime);
      const formattedItem = {
        ...item,
        data: date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short'
        })
      };
      return formattedItem;
    } catch (error) {
      return {
        ...item,
        data: item.data || 'Data'
      };
    }
  });

  console.log('DualAxisChart dados processados:', chartData);

  return (
    <ChartContainer
      title="Evolução da Receita vs. Usuários Ativos"
      subtitle="Análise de correlação diária para insights estratégicos"
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
            stroke="var(--primary-green)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <YAxis
            yAxisId="users"
            orientation="right"
            stroke="var(--primary-dark-blue)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
          />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={(label) => `Data: ${label}`}
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

  console.log('CategoryChart recebeu dados:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('CategoryChart: dados vazios ou inválidos');
    return (
      <ChartContainer
        title={title || "Top Categorias"}
        subtitle="Top 5 categorias por receita gerada"
        loading={loading}
        className={className}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '280px',
          color: '#64748b'
        }}>
          <p>Nenhum dado disponível para exibir</p>
        </div>
      </ChartContainer>
    );
  }

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

export const NetRevenueChart = ({ data, title, loading, className }) => {
  const formatCurrency = (value) => `R$ ${value?.toLocaleString('pt-BR') || '0'}`;

  return (
    <ChartContainer
      title={title || "Receita Líquida por Tipo"}
      subtitle="Comparação de receita líquida entre tipos de cupom"
      loading={loading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary-color)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--text-secondary-color)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(value), name]}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="value"
            name="Receita Líquida"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};


export const DistributionChart = ({ data, title, dataKey = "value", nameKey = "name", loading, className }) => {
  console.log('DistributionChart recebeu dados:', data);
  console.log('DistributionChart dataKey:', dataKey, 'nameKey:', nameKey);

  const formatValue = (value) => {
    if (dataKey === 'valor' || dataKey === 'revenue') {
      return `R$ ${value?.toLocaleString('pt-BR') || '0'}`;
    }
    if (dataKey === 'value' && title?.includes('Margem')) {
      return `${value?.toFixed(2) || '0'}%`;
    }
    if (dataKey === 'value' && typeof value === 'number' && value < 100) {
      return `${value?.toFixed(2) || '0'}%`;
    }
    return `R$ ${value?.toLocaleString('pt-BR') || '0'}`;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('DistributionChart: dados vazios ou inválidos');
    return (
      <ChartContainer
        title={title || "Distribuição"}
        subtitle="Análise de distribuição"
        loading={loading}
        className={className}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '250px',
          color: '#64748b'
        }}>
          <p>Nenhum dado disponível para exibir</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title={title || "Distribuição"}
      subtitle={`Análise de ${data?.length || 0} tipos`}
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
            {data?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const formattedValue = formatValue(value);
              return [formattedValue, name || 'Valor'];
            }}
            labelFormatter={(label) => label || 'Item'}
            content={<CustomTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {data?.map((item, index) => {
          const value = item[dataKey];
          const displayValue = value !== null && value !== undefined ? formatValue(value) : '0';
          return (
            <div key={index} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
              <span className="legend-label">{item[nameKey] || `Item ${index + 1}`}</span>
              <span className="legend-value">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};

export const TemporalChart = ({ data, title, loading, className }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatPercent = (value) => `${value?.toFixed(1)}%`;
  const formatCurrency = (value) => `R$ ${value?.toLocaleString('pt-BR')}`;

  return (
    <ChartContainer
      title={title || "Análise Temporal Diária"}
      subtitle="Evolução da participação e receita ao longo do tempo"
      loading={loading}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary-color)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatDate}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            stroke="#4CAF50"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPercent}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#0D47A1"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            content={<CustomTooltip
              labelFormatter={(label) => `Data: ${formatDate(label)}`}
            />}
          />
          <defs>
            <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="participacao"
            name="Taxa de Participação (%)"
            stroke="#4CAF50"
            strokeWidth={2}
            fill="url(#participationGradient)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="receita"
            name="Receita (R$)"
            stroke="#0D47A1"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
