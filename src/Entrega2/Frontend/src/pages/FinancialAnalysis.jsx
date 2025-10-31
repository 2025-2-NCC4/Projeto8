import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiRefreshCw,
  FiPercent
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/KPICard';
import {
  CategoryChart,
  DistributionChart,
  NetRevenueChart
} from '../components/ChartContainer';
import OperatingMarginChart from '../components/OperatingMarginChart';
import './FinancialAnalysis.css';

const InsightCard = ({ icon, title, value, description, trend = "neutral" }) => (
  <motion.div
    className="insight-card"
    whileHover={{ scale: 1.03, y: -3 }}
    transition={{ duration: 0.2 }}
  >
    <div className="insight-icon">{icon}</div>
    <div className="insight-content">
      <h4>{title}</h4>
      <div className={`insight-value ${trend}`}>{value}</div>
      <p>{description}</p>
    </div>
  </motion.div>
);

const FinancialAnalysis = ({ filters, onError }) => {
  const [data, setData] = useState({
    operatingMargin: { totalRevenue: 0, totalCosts: 0, operatingMargin: 0, monthlyData: [] },
    netRevenue: { summary: { totalGrossRevenue: 0, totalCosts: 0, totalNetRevenue: 0, overallMargin: 0 }, byType: [] }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchData = useCallback(async (isRefresh = false, filtersToUse = filters) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const [operatingMargin, netRevenue] = await Promise.all([
        dashboardAPI.getOperatingMargin(filtersToUse),
        dashboardAPI.getNetRevenue(filtersToUse)
      ]);

      clearTimeout(timeoutId);

      setData({
        operatingMargin: operatingMargin || { totalRevenue: 0, totalCosts: 0, operatingMargin: 0, monthlyData: [] },
        netRevenue: netRevenue || { summary: { totalGrossRevenue: 0, totalCosts: 0, totalNetRevenue: 0, overallMargin: 0 }, byType: [] }
      });
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      if (onError) {
        onError(`Erro ao carregar dados financeiros: ${error.message}`);
      }
      setData({
        operatingMargin: { totalRevenue: 0, totalCosts: 0, operatingMargin: 0, monthlyData: [] },
        netRevenue: { summary: { totalGrossRevenue: 0, totalCosts: 0, totalNetRevenue: 0, overallMargin: 0 }, byType: [] }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setHasInitialized(true);
    }
  }, [onError]);

  useEffect(() => {
    fetchData(false, filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasInitialized) {
      const handler = setTimeout(() => {
        fetchData(true, filters);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => fetchData(true);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.05 } }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading && !refreshing) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Carregando análise financeira...</p>
      </div>
    );
  }

  const { operatingMargin, netRevenue } = data;

  // Prepare chart data
  const monthlyMarginData = operatingMargin?.monthlyData?.map(item => ({
    name: item.month,
    receita: item.revenue,
    custos: item.costs,
    margem: item.margin
  })) || [];

  const netRevenueChartData = netRevenue?.byType?.map(item => ({
    name: item.type,
    value: item.netRevenue,
    gross: item.grossRevenue,
    costs: item.costs
  })) || [];

  const marginDistributionData = netRevenue?.byType?.map(item => ({
    name: item.type,
    value: item.margin,
    count: item.transactions
  })) || [];

  return (
    <motion.div className="financial-analysis-page" variants={pageVariants} initial="hidden" animate="visible"> {/* Keep page-specific container */}
      {/* Page Header Section - now uses common styles */}
      <motion.div className="page-header-section" variants={sectionVariants}>
        <div className="page-header">
          <div className="header-content">
            <h1>Análise Financeira</h1>
            <p>Análise detalhada de margem operacional e receita líquida por tipo de cupom.</p>
          </div>
          <div className="header-actions">
            <motion.button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards - now uses common styles */}
      <motion.div className="kpi-grid" variants={sectionVariants}>
        <KPICard
          icon={<FiDollarSign />}
          title="Receita Total"
          value={`R$ ${operatingMargin?.totalRevenue?.toLocaleString() || '0'}`}
          description="Receita bruta total"
          trend="positive"
        />
        <KPICard
          icon={<FiTrendingUp />}
          title="Margem Operacional"
          value={`${operatingMargin?.operatingMargin?.toFixed(2) || '0'}%`}
          description="Margem operacional média"
          trend={operatingMargin?.operatingMargin > 0 ? "positive" : "negative"}
        />
        <KPICard
          icon={<FiPercent />}
          title="Receita Líquida"
          value={`R$ ${netRevenue?.summary?.totalNetRevenue?.toLocaleString() || '0'}`}
          description="Receita após custos"
          trend="positive"
        />
        <KPICard
          icon={<FiBarChart2 />}
          title="Margem Geral"
          value={`${netRevenue?.summary?.overallMargin?.toFixed(2) || '0'}%`}
          description="Margem líquida geral"
          trend={netRevenue?.summary?.overallMargin > 0 ? "positive" : "negative"}
        />
      </motion.div>

      {/* Monthly Operating Margin Chart - now uses common styles for chart-section and chart-header */}
      <motion.div className="chart-section" variants={sectionVariants}>
        <div className="chart-header">
          <h2>Evolução da Margem Operacional</h2>
          <p>Análise mensal de receita, custos e margem operacional - {operatingMargin?.operatingMargin?.toFixed(2) || '0'}%</p>
        </div>
        <div className="chart-container">
          <OperatingMarginChart
            data={monthlyMarginData}
            title="Evolução da Margem Operacional"
          />
        </div>
        <div style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--card-background)',
          borderRadius: '0 0 1rem 1rem',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          minHeight: '120px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '100%',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '1rem' }}>Receita Total</h4>
              <p>R$ {operatingMargin?.totalRevenue?.toLocaleString() || '0'}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '1rem' }}>Custos Totais</h4>
              <p>R$ {operatingMargin?.totalCosts?.toLocaleString() || '0'}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '1rem' }}>Margem Média</h4>
              <p>{operatingMargin?.operatingMargin?.toFixed(2) || '0'}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Net Revenue by Type - now uses common styles for charts-row and chart-container-half */}
      <motion.div className="charts-row" variants={sectionVariants}>
        <div className="chart-container-half">
          <NetRevenueChart
            data={netRevenueChartData}
            title="Receita Líquida por Tipo"
            loading={loading}
          />
        </div>

        <div className="chart-container-half">
          <DistributionChart
            data={marginDistributionData}
            title="Distribuição de Margem"
            dataKey="value"
            nameKey="name"
            loading={loading}
          />
        </div>
      </motion.div>

      {/* Insights Cards - now uses common styles for insights-grid and insight-card */}
      <motion.div className="insights-grid" variants={sectionVariants}>
        <InsightCard
          icon={<FiTrendingUp />}
          title="Melhor Tipo de Cupom"
          value={netRevenue?.byType?.[0]?.type || 'N/A'}
          description={`Maior receita líquida: R$ ${netRevenue?.byType?.[0]?.netRevenue?.toLocaleString() || '0'}`}
          trend="positive"
        />
        <InsightCard
          icon={<FiPercent />}
          title="Maior Margem"
          value={`${Math.max(...(netRevenue?.byType?.map(t => t.margin) || [0])).toFixed(2)}%`}
          description="Maior margem operacional entre os tipos"
          trend="positive"
        />
        <InsightCard
          icon={<FiDollarSign />}
          title="Custo Total"
          value={`R$ ${operatingMargin?.totalCosts?.toLocaleString() || '0'}`}
          description="Total de custos e repasses"
          trend="neutral"
        />
        <InsightCard
          icon={<FiBarChart2 />}
          title="Eficiência Geral"
          value={`${((netRevenue?.summary?.totalNetRevenue / netRevenue?.summary?.totalGrossRevenue) * 100 || 0).toFixed(2)}%`}
          description="Percentual de receita líquida sobre bruta"
          trend="positive"
        />
      </motion.div>

      {/* Detailed Table - now uses common styles for table-section and table-header */}
      <motion.div className="table-section" variants={sectionVariants}>
        <div className="table-header">
          <h3>Análise Detalhada por Tipo de Cupom</h3>
          <p>Métricas financeiras completas para cada tipo de cupom</p>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo de Cupom</th>
                <th>Receita Bruta</th>
                <th>Custos</th>
                <th>Receita Líquida</th>
                <th>Margem</th>
                <th>Transações</th>
              </tr>
            </thead>
            <tbody>
              {netRevenue?.byType?.map((item, index) => (
                <tr key={index}>
                  <td className="type-cell">{item.type}</td>
                  <td className="currency-cell">R$ {item.grossRevenue.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.costs.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.netRevenue.toLocaleString()}</td>
                  <td className={`percentage-cell ${item.margin > 0 ? 'positive' : 'negative'}`}>
                    {item.margin.toFixed(2)}%
                  </td>
                  <td className="count-cell">{item.transactions.toLocaleString()}</td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FinancialAnalysis;