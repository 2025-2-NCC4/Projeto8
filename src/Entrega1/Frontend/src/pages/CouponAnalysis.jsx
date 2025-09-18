import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiRefreshCw,
  FiPercent,
  FiClock,
  FiActivity
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/KPICard';
import {
  CategoryChart,
  DistributionChart,
  TemporalChart
} from '../components/ChartContainer';
import './CouponAnalysis.css';

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

const CouponAnalysis = ({ filters, onError }) => {
  const [data, setData] = useState({
    performanceByType: [],
    usageTrends: [],
    dailyParticipation: [],
    periodDistribution: [],
    categoriesAnalysis: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchData = useCallback(async (isRefresh = false, filtersToUse = filters) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const [performanceByType, usageTrends, dailyParticipation, periodDistribution, categoriesAnalysis] = await Promise.all([
        dashboardAPI.getCouponPerformanceByType(filtersToUse),
        dashboardAPI.getCouponUsageTrends(filtersToUse),
        dashboardAPI.getDailyParticipation(filtersToUse),
        dashboardAPI.getPeriodDistribution(filtersToUse),
        dashboardAPI.getCategoriesDetailedAnalysis(filtersToUse)
      ]);

      clearTimeout(timeoutId);

      setData({
        performanceByType: performanceByType || [],
        usageTrends: usageTrends || [],
        dailyParticipation: dailyParticipation || [],
        periodDistribution: periodDistribution || [],
        categoriesAnalysis: categoriesAnalysis || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados de cupons:', error);
      if (onError) {
        onError(`Erro ao carregar dados de cupons: ${error.message}`);
      }
      setData({
        performanceByType: [],
        usageTrends: [],
        dailyParticipation: [],
        periodDistribution: [],
        categoriesAnalysis: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setHasInitialized(true);
    }
  }, [onError]);

  useEffect(() => {
    fetchData(false, filters);
  }, [fetchData]);

  useEffect(() => {
    if (hasInitialized) {
      const timeoutId = setTimeout(() => {
        fetchData(true, filters);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

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
        <p>Carregando análise de cupons...</p>
      </div>
    );
  }

  const { performanceByType, dailyParticipation, periodDistribution, categoriesAnalysis } = data;

  // Calculate summary metrics
  const totalCoupons = performanceByType.reduce((sum, type) => sum + type.totalTransactions, 0);
  const totalRevenue = performanceByType.reduce((sum, type) => sum + type.totalValue, 0);
  const averageTicket = totalRevenue / totalCoupons || 0;
  const bestPerformingType = performanceByType[0] || {};

  // Prepare chart data
  const performanceChartData = performanceByType.map(item => ({
    name: item.type,
    receita: item.totalValue,
    cupons: item.totalTransactions,
    ticket: item.avgTicket
  }));

  const dailyChartData = dailyParticipation.map(item => ({
    name: item.date,
    participacao: item.participationRate,
    receita: item.revenue,
    ticket: item.avgTicket
  }));

  const periodChartData = periodDistribution.map(item => ({
    tipo: item.period,
    valor: item.revenue,
    percentage: item.percentage
  }));

  const topCategoriesData = categoriesAnalysis.slice(0, 10).map(item => ({
    categoria: item.category,
    valor: item.revenue,
    participation: item.revenueParticipation
  }));

  return (
    <motion.div className="coupon-analysis-page" variants={pageVariants} initial="hidden" animate="visible">
      <motion.div className="page-header-section" variants={sectionVariants}>
        <div className="page-header">
          <div className="header-content">
            <h1>Análise de Cupons</h1>
            <p>Análise detalhada de performance por tipo de cupom, participação temporal e categorias.</p>
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

      {/* KPI Cards */}
      <motion.div className="kpi-grid" variants={sectionVariants}>
        <KPICard
          icon={<FiTag />}
          title="Total de Cupons"
          value={totalCoupons.toLocaleString()}
          description="Cupons capturados no período"
          trend="positive"
        />
        <KPICard
          icon={<FiTrendingUp />}
          title="Receita Total"
          value={`R$ ${totalRevenue.toLocaleString()}`}
          description="Receita gerada pelos cupons"
          trend="positive"
        />
        <KPICard
          icon={<FiPercent />}
          title="Ticket Médio"
          value={`R$ ${averageTicket.toFixed(2)}`}
          description="Valor médio por cupom"
          trend="neutral"
        />
        <KPICard
          icon={<FiActivity />}
          title="Melhor Tipo"
          value={bestPerformingType.type || 'N/A'}
          description={`${bestPerformingType.totalTransactions?.toLocaleString() || '0'} cupons`}
          trend="positive"
        />
      </motion.div>

      {/* Performance by Type Chart */}
      <motion.div className="chart-section" variants={sectionVariants}>
        <div className="chart-header">
          <h2>Performance por Tipo de Cupom</h2>
          <p>Análise comparativa de receita e volume por tipo de cupom</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem'
        }}>
          {performanceByType.map((type, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              backgroundColor: 'var(--card-background)',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h3>{type.type}</h3>
              <p><strong>Receita:</strong> R$ {type.totalValue.toLocaleString()}</p>
              <p><strong>Cupons:</strong> {type.totalTransactions.toLocaleString()}</p>
              <p><strong>Ticket Médio:</strong> R$ {type.avgTicket.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Daily Participation and Period Distribution */}
      <motion.div className="charts-row" variants={sectionVariants}>
        <div className="chart-container-half">
          <TemporalChart
            data={dailyChartData}
            title="Análise Temporal"
            loading={loading}
          />
          <div style={{ padding: '1rem', marginTop: '1rem' }}>
            <p><strong>Total de dias analisados:</strong> {dailyParticipation.length}</p>
            <p><strong>Taxa média de participação:</strong> {dailyParticipation.length > 0 ?
              (dailyParticipation.reduce((sum, d) => sum + d.participationRate, 0) / dailyParticipation.length).toFixed(2) : 0}%</p>
          </div>
        </div>

        <div className="chart-container-half">
          <div className="chart-header">
            <h3>Distribuição por Período</h3>
            <p>Participação percentual por período do dia</p>
          </div>
          <DistributionChart
            data={periodChartData}
            title="Distribuição por Período"
            dataKey="valor"
          />
        </div>
      </motion.div>

      {/* Top Categories */}
      <motion.div className="chart-section" variants={sectionVariants}>
        <div className="chart-header">
          <h2>Top 10 Categorias de Estabelecimento</h2>
          <p>Maiores categorias por receita e participação percentual</p>
        </div>
        <CategoryChart
          data={topCategoriesData}
          title="Top 10 Categorias"
        />
      </motion.div>

      {/* Insights Cards */}
      <motion.div className="insights-grid" variants={sectionVariants}>
        <InsightCard
          icon={<FiClock />}
          title="Período Mais Ativo"
          value={periodDistribution.reduce((max, p) => p.percentage > max.percentage ? p : max, {period: 'N/A', percentage: 0}).period}
          description={`${periodDistribution.reduce((max, p) => p.percentage > max.percentage ? p : max, {percentage: 0}).percentage.toFixed(1)}% das transações`}
          trend="positive"
        />
        <InsightCard
          icon={<FiUsers />}
          title="Maior Alcance"
          value={performanceByType.reduce((max, p) => p.uniqueCustomers > max.uniqueCustomers ? p : max, {type: 'N/A', uniqueCustomers: 0}).type}
          description={`${performanceByType.reduce((max, p) => p.uniqueCustomers > max.uniqueCustomers ? p : max, {uniqueCustomers: 0}).uniqueCustomers.toLocaleString()} clientes únicos`}
          trend="positive"
        />
        <InsightCard
          icon={<FiShoppingBag />}
          title="Top Categoria"
          value={categoriesAnalysis[0]?.category || 'N/A'}
          description={`${categoriesAnalysis[0]?.revenueParticipation?.toFixed(1) || '0'}% da receita total`}
          trend="positive"
        />
        <InsightCard
          icon={<FiPercent />}
          title="Taxa de Comissão"
          value={`${(performanceByType.reduce((sum, p) => sum + p.commissionRate, 0) / performanceByType.length || 0).toFixed(2)}%`}
          description="Taxa média de comissão por tipo"
          trend="neutral"
        />
      </motion.div>

      {/* Coupon Type Performance Table */}
      <motion.div className="table-section" variants={sectionVariants}>
        <div className="table-header">
          <h3>Performance Detalhada por Tipo de Cupom</h3>
          <p>Métricas completas de performance para cada tipo de cupom</p>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Receita</th>
                <th>Cupons</th>
                <th>Ticket Médio</th>
                <th>Clientes</th>
                <th>Lojas</th>
                <th>Taxa Comissão</th>
                <th>Eficiência</th>
              </tr>
            </thead>
            <tbody>
              {performanceByType.map((item, index) => (
                <tr key={index}>
                  <td className="type-cell">{item.type}</td>
                  <td className="currency-cell">R$ {item.totalValue.toLocaleString()}</td>
                  <td className="count-cell">{item.totalTransactions.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.avgTicket.toFixed(2)}</td>
                  <td className="count-cell">{item.uniqueCustomers.toLocaleString()}</td>
                  <td className="count-cell">{item.uniqueStores.toLocaleString()}</td>
                  <td className="percentage-cell">{item.commissionRate.toFixed(2)}%</td>
                  <td className="currency-cell">R$ {item.efficiency.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Categories Performance Table */}
      <motion.div className="table-section" variants={sectionVariants}>
        <div className="table-header">
          <h3>Performance por Categoria de Estabelecimento</h3>
          <p>Análise detalhada de participação e receita por categoria</p>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Receita</th>
                <th>Transações</th>
                <th>Ticket Médio</th>
                <th>% Receita</th>
                <th>% Transações</th>
                <th>Lojas Únicas</th>
                <th>Clientes Únicos</th>
              </tr>
            </thead>
            <tbody>
              {categoriesAnalysis.slice(0, 15).map((item, index) => (
                <tr key={index}>
                  <td className="type-cell">{item.category}</td>
                  <td className="currency-cell">R$ {item.revenue.toLocaleString()}</td>
                  <td className="count-cell">{item.transactions.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.avgTicket.toFixed(2)}</td>
                  <td className="percentage-cell positive">{item.revenueParticipation.toFixed(2)}%</td>
                  <td className="percentage-cell">{item.transactionParticipation.toFixed(2)}%</td>
                  <td className="count-cell">{item.uniqueStores.toLocaleString()}</td>
                  <td className="count-cell">{item.uniqueCustomers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CouponAnalysis;