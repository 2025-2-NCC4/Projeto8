import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
  FiShoppingBag,
  FiUsers,
  FiShoppingCart
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/KPICard';
import {
  DualAxisChart,
  CategoryChart,
  DistributionChart
} from '../components/ChartContainer';
import FilterPanel from '../components/FilterPanel';
import { useProfile, PROFILES } from '../context/ProfileContext'; // 1. Importado do Arquivo 1
import './Dashboard.css';

// Componente InsightCard (do Arquivo 2)
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

const Dashboard = ({ filters = {}, onFiltersChange }) => {
  // 2. Obter perfil (do Arquivo 1)
  const { currentProfile } = useProfile(); 

  // --- Lógica de Estado e Filtros (do Arquivo 2) ---
  const [data, setData] = useState({
    generalStats: { totalTransactions: 0, totalRevenue: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0, avgTicket: 0 },
    transactionsOverTime: [],
    topCategories: [],
    couponDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [internalFilters, setInternalFilters] = useState({
    startDate: '',
    endDate: '',
    categoria: '',
    bairro: '',
    tipoCupom: '',
    ageRange: '',
    gender: '',
    minValue: '',
    maxValue: '',
    ...filters
  });

  const handleFiltersChange = (newFilters) => {
    setInternalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // --- Lógica de Busca de Dados (do Arquivo 2) ---
  const fetchData = useCallback(async (isRefresh = false, filtersToUse = internalFilters) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('Tentando carregar dados da API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [stats, timeData, categories, coupons] = await Promise.all([
        dashboardAPI.getGeneralStats(filtersToUse).catch(err => {
          console.warn('Erro ao buscar stats gerais:', err);
          return { totalTransactions: 15420, totalRevenue: 892000, avgTicket: 57.85, totalCommission: 125000, uniqueStores: 234, uniqueCustomers: 8945 };
        }),
        dashboardAPI.getTransactionsOverTime(filtersToUse).catch(err => {
          console.warn('Erro ao buscar dados temporais:', err);
          return [];
        }),
        dashboardAPI.getTopCategories(filtersToUse).catch(err => {
          console.warn('Erro ao buscar categorias:', err);
          return [];
        }),
        dashboardAPI.getCouponDistribution(filtersToUse).catch(err => {
          console.warn('Erro ao buscar distribuição de cupons:', err);
          return [];
        })
      ]);

      clearTimeout(timeoutId);
      console.log('Dados recebidos da API:', { stats, timeData, categories, coupons });

      setData({
        generalStats: stats || { totalTransactions: 15420, totalRevenue: 892000, avgTicket: 57.85, totalCommission: 125000, uniqueStores: 234, uniqueCustomers: 8945 },
        transactionsOverTime: timeData || [],
        topCategories: categories || [],
        couponDistribution: coupons || []
      });
    } catch (error) {
      console.error('Erro geral ao carregar dados do dashboard:', error);
      setData({
        generalStats: { totalTransactions: 15420, totalRevenue: 892000, avgTicket: 57.85, totalCommission: 125000, uniqueStores: 234, uniqueCustomers: 8945 },
        transactionsOverTime: [],
        topCategories: [],
        couponDistribution: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setHasInitialized(true);
    }
  }, [internalFilters]);

  // --- Hooks de Efeito (do Arquivo 2) ---
  // Initial data load
  useEffect(() => {
    fetchData(false, internalFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when filters change
  useEffect(() => {
    if (hasInitialized) {
      // Debounce filter changes to avoid excessive API calls
      const handler = setTimeout(() => {
        fetchData(true, internalFilters);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [internalFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => fetchData(true);

  // --- Variantes de Animação (do Arquivo 2) ---
  const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.05 } } };
  const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  // --- 3. Renderização condicional de KPIs (do Arquivo 1) ---
  // Esta função agora usa o estado 'data' local em vez de props
  const renderKPIs = () => {
    const stats = data.generalStats || {};
    
    if (currentProfile === PROFILES.CEO) {
      // RF03: Foco em performance geral e crescimento
      return (
        <>
          <KPICard
            icon={<FiUsers />}
            title="Usuários Ativos"
            value={stats.uniqueCustomers || 0}
            index={0}
          />
          <KPICard
            icon={<FiShoppingCart />}
            title="Cupons Capturados"
            value={stats.totalTransactions || 0}
            index={1}
          />
          <KPICard
            icon={<FiShoppingBag />}
            title="Lojas Ativas"
            value={stats.uniqueStores || 0}
            index={2}
          />
          <KPICard
            icon={<FiBarChart />}
            title="Ticket Médio"
            value={stats.avgTicket || 0}
            format="currency"
            index={3}
          />
        </>
      );
    }
    
    if (currentProfile === PROFILES.CFO) {
      // RF02: Foco em dados financeiros
      return (
        <>
          <KPICard
            icon={<FiDollarSign />}
            title="Receita Total (Bruta)"
            value={stats.totalRevenue || 0}
            format="currency"
            index={0}
          />
          <KPICard
            icon={<FiTrendingUp />}
            title="Receita PicMoney (Repasse)"
            value={stats.totalCommission || 0}
            format="currency"
            index={1}
          />
           <KPICard
            icon={<FiBarChart />}
            title="Ticket Médio"
            value={stats.avgTicket || 0}
            format="currency"
            index={2}
          />
          <KPICard
            icon={<FiPieChart />}
            title="Margem Operacional (Média)"
            value={stats.totalRevenue > 0 ? (((stats.totalRevenue - stats.totalCommission) / stats.totalRevenue * 100).toFixed(2)) : '0.00'}
            format="percentage"
            index={3}
          />
        </>
      );
    }
  };

  // --- Processamento de Dados (do Arquivo 2) ---
  // É importante processar os dados antes de passá-los para 'renderCharts'
  const monthlyData = (data.transactionsOverTime || [])
    .map(item => ({
      data: item.data || item.date || item.month || new Date().toISOString().split('T')[0],
      receita_picmoney: item.receita_picmoney || item.revenue || item.totalRevenue || 0,
      usuarios_ativos: item.usuarios_ativos || item.transactions || item.totalTransactions || 0
    }))
    .filter(item => item.receita_picmoney > 0 || item.usuarios_ativos > 0);

  const categoriesData = (data.topCategories || [])
    .map(item => ({
      categoria: item.categoria || item.category || item.name || 'Categoria',
      valor: item.valor || item.revenue || item.value || 0
    }))
    .filter(item => item.valor > 0);

  const distributionData = (data.couponDistribution || [])
    .map(item => ({
      tipo: item.tipo || item.type || item.name || 'Tipo',
      valor: item.valor || item.amount || item.value || item.revenue || 0,
      percentage: item.percentual || item.percentage || 0
    }))
    .filter(item => item.valor > 0);

  const finalMonthlyData = monthlyData || [];
  const finalCategoriesData = categoriesData || [];
  const finalDistributionData = distributionData || [];


  // --- 4. Renderização condicional de Gráficos (do Arquivo 1) ---
  // Modificado para usar os dados processados 'final...Data'
  const renderCharts = () => {
    if (currentProfile === PROFILES.CEO) {
      // Gráficos de Crescimento, Campanha, Usuário
      return (
        <>
          <motion.div className="chart-section" variants={sectionVariants}>
            <DualAxisChart data={finalMonthlyData} loading={loading} />
          </motion.div>
          <motion.div className="charts-row" variants={sectionVariants}>
            <div className="chart-container-half">
              <CategoryChart data={finalCategoriesData} title="Top Categorias" loading={loading} />
            </div>
            <div className="chart-container-half">
              <DistributionChart data={finalDistributionData} title="Distribuição de Cupons" dataKey="valor" nameKey="tipo" loading={loading} />
            </div>
          </motion.div>
        </>
      );
    }
    if (currentProfile === PROFILES.CFO) {
      // Gráficos Financeiros
      return (
        <>
          <motion.div className="chart-section" variants={sectionVariants}>
            {/* Título ajustado para o CFO */}
            <DualAxisChart data={finalMonthlyData} title="Receita (Bruta) vs Transações" loading={loading} />
          </motion.div>
          <motion.div className="charts-row" variants={sectionVariants}>
             <div className="chart-container-half">
               {/* Título ajustado para o CFO */}
               <DistributionChart data={finalDistributionData} title="Receita por Tipo de Cupom" dataKey="valor" nameKey="tipo" loading={loading} />
             </div>
             <div className="chart-container-half">
               {/* Título ajustado para o CFO */}
               <CategoryChart data={finalCategoriesData} title="Top Categorias por Receita" loading={loading} />
             </div>
          </motion.div>
        </>
      );
    }
  };

  // --- Renderização do Loading (do Arquivo 2) ---
  if (loading && !hasInitialized) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Carregando insights estratégicos...</p>
      </div>
    );
  }

  // --- 5. JSX Principal (Fusão dos dois) ---
  return (
    <motion.div className="dashboard-page" variants={pageVariants} initial="hidden" animate="visible">
      {/* O padding e max-width do .dashboard-page agora estão no App.css para consistência */}
      
      {/* Cabeçalho dinâmico (baseado no Arquivo 1) */}
      <motion.div className="page-header-section" variants={sectionVariants}>
        <div className="page-header">
          <div className="header-content">
            <h1>Dashboard {currentProfile === PROFILES.CEO ? 'Estratégico (CEO)' : 'Financeiro (CFO)'}</h1>
            <p>
              {currentProfile === PROFILES.CEO 
                ? 'Visão executiva dos principais indicadores de performance e crescimento.' 
                : 'Análise detalhada dos indicadores financeiros, receita e margens.'}
            </p>
          </div>
          {/* Controles de Filtro (do Arquivo 2) */}
          <div className="header-actions">
            <FilterPanel
              filters={internalFilters}
              onFiltersChange={handleFiltersChange}
              isOpen={filterPanelOpen}
              onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
            />
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

      {/* KPI Cards Dinâmicos (Chamando renderKPIs() do Arquivo 1) */}
      <motion.div className="kpi-grid" variants={sectionVariants}>
        {renderKPIs()}
      </motion.div>

      {/* Gráficos Dinâmicos (Chamando renderCharts() do Arquivo 1) */}
      {renderCharts()}

      {/* Seção de Insights (do Arquivo 2, agora condicional para CFO) */}
      {currentProfile === PROFILES.CFO && (
        <motion.section className="insights-section" variants={sectionVariants}>
          <div className="insights-header">
            <div className="insights-title"><FiActivity size={24} /><h3>Indicadores Financeiros Chave</h3></div>
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
      )}
    </motion.div>
  );
};

export default Dashboard;