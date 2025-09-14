import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import KPICard from '../components/KPICard';
import { 
  DualAxisChart, 
  CategoryChart, 
  DistributionChart, 
} from '../components/ChartContainer';
import FilterPanel from '../components/FilterPanel';
import './Dashboard.css';

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
  const [loading, setLoading] = useState(false); // Start with false to show interface immediately
  const [refreshing, setRefreshing] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!hasInitialized) setLoading(true);

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const dataPromise = Promise.all([
        dashboardAPI.getGeneralStats(stableFilters),
        dashboardAPI.getTransactionsOverTime(stableFilters),
        dashboardAPI.getTopCategories(stableFilters),
        dashboardAPI.getCouponDistribution(stableFilters)
      ]);

      const [stats, timeData, categories, coupons] = await Promise.race([dataPromise, timeout]);
      setData({ generalStats: stats, transactionsOverTime: timeData, topCategories: categories, couponDistribution: coupons });
      setHasInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setHasInitialized(true); // Always set initialized even on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stableFilters, hasInitialized]);

  useEffect(() => {
    // Delay the data fetch by 500ms to let the UI render first
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    // Force initialization after 8 seconds as a fallback
    const forceInitTimer = setTimeout(() => {
      if (!hasInitialized) {
        console.warn('Forcing initialization due to timeout');
        setHasInitialized(true);
        setLoading(false);
        setRefreshing(false);
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(forceInitTimer);
    };
  }, [hasInitialized]);

  const handleRefresh = () => fetchData(true);

  const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.05 } } };
  const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  if (loading && !hasInitialized) {
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
            <FilterPanel filters={filters} onFiltersChange={onFiltersChange} isOpen={filterPanelOpen} onToggle={() => setFilterPanelOpen(!filterPanelOpen)} />
          </div>
        </div>
      </motion.div>

      <motion.section className="kpi-section" variants={sectionVariants}>
        <div className="kpi-grid">
          <KPICard title="Receita PicMoney" value={`R$ ${(data.generalStats.totalCommission || 0).toLocaleString('pt-BR')}`} change="+12.5%" changeType="positive" icon="revenue" loading={refreshing} index={0} />
          <KPICard title="Lojas Ativas" value={(data.generalStats.uniqueStores || 0).toLocaleString('pt-BR')} change="+5.3%" changeType="positive" icon="stores" loading={refreshing} index={1} />
          <KPICard title="Cupons Capturados" value={(data.generalStats.totalTransactions || 0).toLocaleString('pt-BR')} change="+21.7%" changeType="positive" icon="coupons" loading={refreshing} index={2} />
          <KPICard title="Usuários Ativos" value={(data.generalStats.uniqueCustomers || 0).toLocaleString('pt-BR')} change="+8.2%" changeType="positive" icon="users" loading={refreshing} index={3} />
        </div>
      </motion.section>

      {hasInitialized && data.transactionsOverTime.length > 0 && (
        <motion.section className="main-chart-section" variants={sectionVariants}>
          <DualAxisChart data={data.transactionsOverTime} loading={refreshing} className="featured-chart" />
        </motion.section>
      )}

      {hasInitialized && (
        <motion.section className="analytics-section" variants={sectionVariants}>
          <div className="analytics-grid">
            {data.topCategories.length > 0 && (
              <CategoryChart data={data.topCategories} title="Receita por Categoria" loading={refreshing} className="category-analysis" />
            )}
            {data.couponDistribution.length > 0 && (
              <DistributionChart data={data.couponDistribution} title="Distribuição de Cupons (por valor)" dataKey="valor" nameKey="tipo" loading={refreshing} className="distribution-analysis" />
            )}
          </div>
        </motion.section>
      )}

      <motion.section className="insights-section" variants={sectionVariants}>
        <div className="insights-header">
          <div className="insights-title"><FiActivity size={24} /><h3>Insights Estratégicos</h3></div>
        </div>
        <div className="insights-grid">
          <InsightCard icon={<FiTrendingUp />} title="Correlação Receita x Usuários" value="Positiva Forte" description="O crescimento saudável de usuários está diretamente ligado ao aumento da receita."
            trend="positive" />
          <InsightCard icon={<FiDollarSign />} title="Receita por Usuário (LTV Simplificado)" value={`R$ ${((data.generalStats.totalCommission || 0) / (data.generalStats.uniqueCustomers || 1)).toFixed(2)}`} description="Valor médio que cada usuário gera para a PicMoney."
            trend="neutral" />
          <InsightCard icon={<FiBarChart />} title="Eficiência do Cupom" value={`R$ ${((data.generalStats.totalCommission || 0) / (data.generalStats.totalTransactions || 1)).toFixed(2)}`} description="Receita média gerada por cada cupom capturado."
            trend="positive" />
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Dashboard;
