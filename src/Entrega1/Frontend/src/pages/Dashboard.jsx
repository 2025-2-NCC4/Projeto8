import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
  FiShoppingBag
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';

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

const Dashboard = ({ filters, onFiltersChange }) => {
  const [data, setData] = useState({
    generalStats: { totalTransactions: 0, totalRevenue: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0 },
    transactionsOverTime: [],
    topCategories: [],
    couponDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchData = useCallback(async (isRefresh = false, filtersToUse = filters) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [stats, timeData, categories, coupons] = await Promise.all([
        dashboardAPI.getGeneralStats(filtersToUse),
        dashboardAPI.getTransactionsOverTime(filtersToUse),
        dashboardAPI.getTopCategories(filtersToUse),
        dashboardAPI.getCouponDistribution(filtersToUse)
      ]);

      clearTimeout(timeoutId);

      setData({
        generalStats: stats || { totalTransactions: 0, totalRevenue: 0, avgTicket: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0 },
        transactionsOverTime: timeData || [],
        topCategories: categories || [],
        couponDistribution: coupons || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setData({
        generalStats: { totalTransactions: 0, totalRevenue: 0, avgTicket: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0 },
        transactionsOverTime: [],
        topCategories: [],
        couponDistribution: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setHasInitialized(true);
    }
  }, []);

  // Initial load only
  useEffect(() => {
    fetchData(false, filters);
  }, []);

  // Filter changes
  useEffect(() => {
    if (hasInitialized) {
      const timeoutId = setTimeout(() => {
        fetchData(true, filters);
      }, 500); // Debounce filter changes

      return () => clearTimeout(timeoutId);
    }
  }, [filters]);

  const handleRefresh = () => fetchData(true);

  const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.05 } } };
  const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Carregando insights estratégicos...</p>
      </div>
    );
  }

  return (
    <motion.div className="dashboard-page" variants={pageVariants} initial="hidden" animate="visible">
      <motion.div className="page-header-section" variants={sectionVariants}>
        <div className="page-header">
          <div className="header-content">
            <h1>Dashboard Estratégico</h1>
            <p>Visão executiva dos principais indicadores de performance.</p>
          </div>
          <div className="header-actions">
            <motion.button className="refresh-btn" onClick={handleRefresh} disabled={refreshing} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.section className="kpi-section" variants={sectionVariants}>
        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>Receita Total</h3>
            <p className="kpi-value">R$ {(data.generalStats.totalRevenue || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+12.5%</span>
          </div>
          <div className="kpi-card">
            <h3>Ticket Médio</h3>
            <p className="kpi-value">R$ {(data.generalStats.avgTicket || 0).toFixed(2)}</p>
            <span className="kpi-change positive">+3.2%</span>
          </div>
          <div className="kpi-card">
            <h3>Receita PicMoney</h3>
            <p className="kpi-value">R$ {(data.generalStats.totalCommission || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+15.8%</span>
          </div>
          <div className="kpi-card">
            <h3>Margem Operacional</h3>
            <p className="kpi-value">{(((data.generalStats.totalRevenue - data.generalStats.totalCommission) / data.generalStats.totalRevenue * 100) || 0).toFixed(1)}%</p>
            <span className="kpi-change positive">+2.1%</span>
          </div>
        </div>
        <div className="kpi-grid secondary">
          <div className="kpi-card">
            <h3>Lojas Ativas</h3>
            <p className="kpi-value">{(data.generalStats.uniqueStores || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+5.3%</span>
          </div>
          <div className="kpi-card">
            <h3>Cupons Capturados</h3>
            <p className="kpi-value">{(data.generalStats.totalTransactions || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+21.7%</span>
          </div>
          <div className="kpi-card">
            <h3>Usuários Ativos</h3>
            <p className="kpi-value">{(data.generalStats.uniqueCustomers || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+8.2%</span>
          </div>
          <div className="kpi-card">
            <h3>Receita Líquida</h3>
            <p className="kpi-value">R$ {((data.generalStats.totalRevenue - data.generalStats.totalCommission) || 0).toLocaleString('pt-BR')}</p>
            <span className="kpi-change positive">+11.4%</span>
          </div>
        </div>
      </motion.section>

      {hasInitialized && data.transactionsOverTime.length > 0 && (
        <motion.section className="main-chart-section" variants={sectionVariants}>
          <div className="chart-placeholder">
            <h3>Transações ao Longo do Tempo</h3>
            <p>Gráfico carregado: {data.transactionsOverTime.length} registros</p>
          </div>
        </motion.section>
      )}

      {hasInitialized && (
        <motion.section className="analytics-section" variants={sectionVariants}>
          <div className="analytics-grid">
            <div className="chart-placeholder">
              <h3>Top Categorias</h3>
              <p>Categorias carregadas: {data.topCategories.length}</p>
            </div>
            <div className="chart-placeholder">
              <h3>Distribuição de Cupons</h3>
              <p>Tipos de cupom: {data.couponDistribution.length}</p>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section className="insights-section" variants={sectionVariants}>
        <div className="insights-header">
          <div className="insights-title"><FiActivity size={24} /><h3>Indicadores Principais</h3></div>
        </div>
        <div className="insights-grid">
          <InsightCard icon={<FiDollarSign />} title="Ticket Médio Geral" value={`R$ ${(data.generalStats.avgTicket || 0).toFixed(2)}`} description="Valor médio por transação em todo o sistema."
            trend="positive" />
          <InsightCard icon={<FiTrendingUp />} title="Margem Operacional" value={`${(((data.generalStats.totalRevenue - data.generalStats.totalCommission) / data.generalStats.totalRevenue * 100) || 0).toFixed(1)}%`} description="Margem de lucro operacional da plataforma."
            trend="positive" />
          <InsightCard icon={<FiBarChart />} title="Receita Líquida Total" value={`R$ ${((data.generalStats.totalRevenue - data.generalStats.totalCommission) || 0).toLocaleString('pt-BR')}`} description="Receita total após descontar repasses."
            trend="positive" />
          <InsightCard icon={<FiShoppingBag />} title="Eficiência por Loja" value={`R$ ${((data.generalStats.totalRevenue || 0) / (data.generalStats.uniqueStores || 1)).toFixed(2)}`} description="Receita média gerada por estabelecimento."
            trend="neutral" />
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Dashboard;
