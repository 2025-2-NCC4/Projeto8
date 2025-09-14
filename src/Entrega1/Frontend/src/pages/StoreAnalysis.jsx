import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiTrendingUp, 
  FiDollarSign, 
  FiTarget, 
  FiChevronUp,
  FiChevronDown,
  FiAward,
  FiBarChart,
  FiFilter,
  FiStar
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import { dashboardAPI } from '../services/api';
import './StoreAnalysis.css';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const PerformanceTable = ({ data, onSort, sortConfig }) => {
  if (!data || data.length === 0) {
    return <div className="table-placeholder">Nenhuma loja encontrada para os filtros selecionados.</div>;
  }

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <FiChevronDown size={14} className="sort-icon neutral" />;
    return sortConfig.direction === 'asc' ? <FiChevronUp size={14} className="sort-icon asc" /> : <FiChevronDown size={14} className="sort-icon desc" />;
  };

  const getMedal = (index) => {
    if (index === 0) return <FiAward className="medal-icon gold" />;
    if (index === 1) return <FiAward className="medal-icon silver" />;
    if (index === 2) return <FiAward className="medal-icon bronze" />;
    return null;
  };

  return (
    <div className="performance-table-container">
      <div className="table-header">
        <div className="table-title"><FiAward size={24} /><h3>Ranking de Performance das Lojas</h3></div>
        <p>Análise detalhada da performance de cada loja parceira. Clique nos cabeçalhos para ordenar.</p>
      </div>
      <div className="table-wrapper">
        <table className="performance-table">
          <thead>
            <tr>
              <th onClick={() => onSort('posicao')}># {getSortIcon('posicao')}</th>
              <th onClick={() => onSort('nome_loja')}>Loja {getSortIcon('nome_loja')}</th>
              <th onClick={() => onSort('categoria')}>Categoria {getSortIcon('categoria')}</th>
              <th onClick={() => onSort('receita_gerada')}>Receita (PicMoney) {getSortIcon('receita_gerada')}</th>
              <th onClick={() => onSort('cupons_capturados')}>Cupons {getSortIcon('cupons_capturados')}</th>
              <th onClick={() => onSort('ticket_medio')}>Ticket Médio {getSortIcon('ticket_medio')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((loja, index) => (
              <tr key={loja.nome_loja} className={index < 3 ? 'top-performer' : ''}>
                <td><div className="rank-cell">{getMedal(index)}{loja.posicao}</div></td>
                <td><div className="store-name">{loja.nome_loja}</div></td>
                <td><span className="category-tag">{loja.categoria}</span></td>
                <td><div className="currency-cell">{formatCurrency(loja.receita_gerada)}</div></td>
                <td><div className="number-cell">{loja.cupons_capturados.toLocaleString('pt-BR')}</div></td>
                <td><div className="currency-cell">{formatCurrency(loja.ticket_medio)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StoreMetrics = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { totalLojas: 0, receitaMedia: 0, cuponsMedia: 0, ticketMedioGeral: 0 };
    const totalReceita = data.reduce((sum, loja) => sum + (loja.receita_gerada || 0), 0);
    const totalCupons = data.reduce((sum, loja) => sum + (loja.cupons_capturados || 0), 0);
    return {
      totalLojas: data.length,
      receitaMedia: totalReceita / data.length,
      cuponsMedia: totalCupons / data.length,
      ticketMedioGeral: data.reduce((sum, loja) => sum + (loja.ticket_medio || 0), 0) / data.length
    };
  }, [data]);

  return (
    <div className="store-metrics">
      <div className="metrics-cards">
        <div className="metric-card"><div className="metric-icon"><FiShoppingBag size={20} /></div><div className="metric-content"><div className="metric-label">Lojas na Análise</div><div className="metric-value">{metrics.totalLojas}</div></div></div>
        <div className="metric-card"><div className="metric-icon"><FiDollarSign size={20} /></div><div className="metric-content"><div className="metric-label">Receita Média</div><div className="metric-value">{formatCurrency(metrics.receitaMedia)}</div></div></div>
        <div className="metric-card"><div className="metric-icon"><FiTarget size={20} /></div><div className="metric-content"><div className="metric-label">Média de Cupons</div><div className="metric-value">{Math.round(metrics.cuponsMedia || 0)}</div></div></div>
        <div className="metric-card"><div className="metric-icon"><FiTrendingUp size={20} /></div><div className="metric-content"><div className="metric-label">Ticket Médio Geral</div><div className="metric-value">{formatCurrency(metrics.ticketMedioGeral)}</div></div></div>
      </div>
    </div>
  );
};

const CategoryPerformance = ({ data }) => {
  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const categoryStats = data.reduce((acc, loja) => {
      const cat = loja.categoria || 'Não Informada';
      if (!acc[cat]) acc[cat] = { receita_total: 0, num_lojas: 0 };
      acc[cat].receita_total += loja.receita_gerada || 0;
      acc[cat].num_lojas++;
      return acc;
    }, {});
    return Object.entries(categoryStats)
      .map(([categoria, stats]) => ({ ...stats, categoria }))
      .sort((a, b) => b.receita_total - a.receita_total).slice(0, 10);
  }, [data]);

  return (
    <div className="analysis-item category-performance">
      <div className="category-title"><FiBarChart size={24} /><h3>Top Categorias por Receita</h3></div>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => `${formatCurrency(value/1000)}k`} />
          <YAxis type="category" dataKey="categoria" width={80} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar dataKey="receita_total" name="Receita Total" fill="#4CAF50" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ScatterPlotAnalysis = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>{d.nome_loja}</strong></p>
          <p>Receita: {formatCurrency(d.receita_gerada)}</p>
          <p>Cupons: {d.cupons_capturados}</p>
          <p>Ticket Médio: {formatCurrency(d.ticket_medio)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analysis-item scatter-plot">
      <div className="scatter-title"><FiTarget size={24} /><h3>Análise de Eficiência das Lojas</h3></div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="cupons_capturados" name="Cupons Capturados" tick={{ fontSize: 12 }} />
          <YAxis type="number" dataKey="receita_gerada" name="Receita Gerada" tickFormatter={(value) => `${formatCurrency(value/1000)}k`} tick={{ fontSize: 12 }} />
          <ZAxis type="number" dataKey="ticket_medio" range={[60, 400]} name="Ticket Médio" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Legend />
          <Scatter name="Lojas" data={data} fill="#4CAF50" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const StoreAnalysis = ({ filters }) => {
  const [storesData, setStoresData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [topN, setTopN] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'receita_gerada', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stores = await dashboardAPI.getStoresPerformanceRanking(filters);
        setStoresData(stores);
      } catch (err) {
        console.error('Erro ao carregar análise de lojas:', err);
        setError('Não foi possível carregar os dados das lojas.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const categories = useMemo(() => ['Todas', ...new Set(storesData.map(loja => loja.categoria))], [storesData]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = categoryFilter === 'Todas' ? [...storesData] : storesData.filter(l => l.categoria === categoryFilter);
    return filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const order = sortConfig.direction === 'asc' ? 1 : -1;
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * order;
      return (aVal - bVal) * order;
    }).slice(0, topN);
  }, [storesData, categoryFilter, topN, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  if (loading) return <div className="loading">Carregando análise de lojas...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <motion.div 
      className="store-analysis-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div className="page-title"><FiShoppingBag size={32} /><h1>Análise de Performance das Lojas</h1></div>
        <p>Avalie o desempenho das lojas parceiras através de métricas chave e rankings.</p>
      </div>

      <StoreMetrics data={storesData} />

      <div className="analysis-controls">
        <div className="control-group">
          <label><FiFilter size={16} />Filtrar por Categoria:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label><FiStar size={16} />Mostrar Top:</label>
          <select value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
            <option value={10}>10 Lojas</option>
            <option value={20}>20 Lojas</option>
            <option value={50}>50 Lojas</option>
            <option value={100}>Todas</option>
          </select>
        </div>
      </div>

      <PerformanceTable data={filteredAndSortedData} onSort={handleSort} sortConfig={sortConfig} />

      <div className="additional-analysis">
        <CategoryPerformance data={storesData} />
        <ScatterPlotAnalysis data={storesData} />
      </div>
    </motion.div>
  );
};

export default StoreAnalysis;
