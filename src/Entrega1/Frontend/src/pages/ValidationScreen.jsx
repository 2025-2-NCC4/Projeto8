import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTag,
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiEye,
  FiAlertCircle
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/KPICard';
import {
  CategoryChart,
  DistributionChart
} from '../components/ChartContainer';
import './ValidationScreen.css';

const StatusBadge = ({ status, count }) => (
  <div className={`status-badge ${status.toLowerCase()}`}>
    <div className="status-indicator">
      {status === 'Validado' ? <FiCheckCircle /> : status === 'Pendente' ? <FiClock /> : <FiAlertCircle />}
    </div>
    <span>{status}</span>
    <span className="status-count">({count})</span>
  </div>
);

const ValidationScreen = ({ filters }) => {
  const [data, setData] = useState({
    couponSummary: [],
    payoutTracking: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const dataPromise = Promise.all([
        dashboardAPI.getCouponSummary(stableFilters),
        dashboardAPI.getPayoutTracking(stableFilters)
      ]);

      const [couponSummary, payoutTracking] = await Promise.race([dataPromise, timeout]);

      setData({
        couponSummary,
        payoutTracking
      });
    } catch (error) {
      console.error('Erro ao carregar dados de validação:', error);
      // Set empty data to prevent infinite loading
      setData({
        couponSummary: [],
        payoutTracking: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stableFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <p>Carregando painel de validação...</p>
      </div>
    );
  }

  const { couponSummary, payoutTracking } = data;

  // Calculate summary metrics
  const totalCoupons = couponSummary.reduce((sum, item) => sum + item.totalCoupons, 0);
  const totalValidated = couponSummary.reduce((sum, item) => sum + item.validatedCoupons, 0);
  const totalPending = couponSummary.reduce((sum, item) => sum + item.pendingCoupons, 0);
  const totalRevenue = couponSummary.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalPayouts = couponSummary.reduce((sum, item) => sum + item.totalPayout, 0);
  const validationRate = totalCoupons > 0 ? (totalValidated / totalCoupons) * 100 : 0;

  // Filter data based on selected filters
  const filteredCouponData = selectedFilter === 'all'
    ? couponSummary
    : couponSummary.filter(item => item.type.toLowerCase().includes(selectedFilter.toLowerCase()));

  const availableMonths = [...new Set(payoutTracking.map(item => item.month))].sort();
  const filteredPayoutData = selectedMonth === 'all'
    ? payoutTracking
    : payoutTracking.filter(item => item.month === selectedMonth);

  // Prepare chart data
  const revenueByTypeData = filteredCouponData.map(item => ({
    categoria: item.type,
    valor: item.totalRevenue,
    count: item.totalCoupons
  }));

  const validationRateData = filteredCouponData.map(item => ({
    name: item.type,
    value: item.validationRate,
    validated: item.validatedCoupons,
    pending: item.pendingCoupons
  }));

  const payoutStatusData = filteredPayoutData.reduce((acc, item) => {
    const existing = acc.find(a => a.tipo === item.status);
    if (existing) {
      existing.valor += item.totalPayout;
      existing.count += 1;
    } else {
      acc.push({
        tipo: item.status,
        valor: item.totalPayout,
        count: 1
      });
    }
    return acc;
  }, []);

  return (
    <motion.div className="validation-screen-page" variants={pageVariants} initial="hidden" animate="visible">
      <motion.div className="page-header-section" variants={sectionVariants}>
        <div className="page-header">
          <div className="header-content">
            <h1>Central de Validação</h1>
            <p>Validação de cupons, gestão de tipos e controle de repasses para estabelecimentos.</p>
          </div>
          <div className="header-actions">
            <motion.button
              className="action-btn secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiDownload />
              Exportar
            </motion.button>
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
          description="Cupons no sistema"
          trend="positive"
        />
        <KPICard
          icon={<FiCheckCircle />}
          title="Taxa de Validação"
          value={`${validationRate.toFixed(1)}%`}
          description={`${totalValidated.toLocaleString()} validados`}
          trend="positive"
        />
        <KPICard
          icon={<FiClock />}
          title="Pendentes"
          value={totalPending.toLocaleString()}
          description="Aguardando validação"
          trend={totalPending > 0 ? "warning" : "positive"}
        />
        <KPICard
          icon={<FiDollarSign />}
          title="Repasses Totais"
          value={`R$ ${totalPayouts.toLocaleString()}`}
          description={`De R$ ${totalRevenue.toLocaleString()} em receita`}
          trend="positive"
        />
      </motion.div>

      {/* Filter Controls */}
      <motion.div className="filter-section" variants={sectionVariants}>
        <div className="filter-controls">
          <div className="filter-group">
            <label><FiFilter /> Tipo de Cupom</label>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
              <option value="all">Todos os tipos</option>
              {couponSummary.map(item => (
                <option key={item.type} value={item.type}>{item.type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label><FiClock /> Período</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="all">Todos os meses</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Revenue and Validation Charts */}
      <motion.div className="charts-row" variants={sectionVariants}>
        <div className="chart-container-half">
          <div className="chart-header">
            <h3>Receita por Tipo de Cupom</h3>
            <p>Distribuição de receita entre os tipos de cupom</p>
          </div>
          <CategoryChart
            data={revenueByTypeData}
            title="Receita por Tipo"
          />
        </div>

        <div className="chart-container-half">
          <div className="chart-header">
            <h3>Status dos Repasses</h3>
            <p>Distribuição dos repasses por status de pagamento</p>
          </div>
          <DistributionChart
            data={payoutStatusData}
            title="Status dos Repasses"
            dataKey="valor"
          />
        </div>
      </motion.div>

      {/* Coupon Summary Table */}
      <motion.div className="table-section" variants={sectionVariants}>
        <div className="table-header">
          <h3>Resumo de Validação por Tipo de Cupom</h3>
          <p>Status de validação e valores por tipo de cupom</p>
        </div>
        <div className="table-container">
          <table className="validation-table">
            <thead>
              <tr>
                <th>Tipo de Cupom</th>
                <th>Total</th>
                <th>Validados</th>
                <th>Pendentes</th>
                <th>Taxa</th>
                <th>Receita</th>
                <th>Repasses</th>
                <th>Valor Médio</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCouponData.map((item, index) => (
                <tr key={index}>
                  <td className="type-cell">{item.type}</td>
                  <td className="count-cell">{item.totalCoupons.toLocaleString()}</td>
                  <td className="count-cell success">{item.validatedCoupons.toLocaleString()}</td>
                  <td className="count-cell warning">{item.pendingCoupons.toLocaleString()}</td>
                  <td className="percentage-cell">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.validationRate}%` }}
                      ></div>
                      <span>{item.validationRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="currency-cell">R$ {item.totalRevenue.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.totalPayout.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.avgCouponValue.toFixed(2)}</td>
                  <td>
                    <StatusBadge
                      status={item.pendingCoupons > 0 ? 'Pendente' : 'Validado'}
                      count={item.pendingCoupons > 0 ? item.pendingCoupons : item.validatedCoupons}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn small">
                        <FiEye />
                      </button>
                      <button className="action-btn small primary">
                        <FiCheckCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payout Tracking Table */}
      <motion.div className="table-section" variants={sectionVariants}>
        <div className="table-header">
          <h3>Controle de Repasses</h3>
          <p>Acompanhamento de repasses mensais por estabelecimento</p>
        </div>
        <div className="table-container">
          <table className="payout-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Estabelecimento</th>
                <th>Repasse Total</th>
                <th>Transações</th>
                <th>Receita</th>
                <th>Taxa de Repasse</th>
                <th>Repasse Médio</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayoutData.slice(0, 20).map((item, index) => (
                <tr key={index}>
                  <td className="month-cell">{item.month}</td>
                  <td className="store-cell">{item.store}</td>
                  <td className="currency-cell primary">R$ {item.totalPayout.toLocaleString()}</td>
                  <td className="count-cell">{item.transactions.toLocaleString()}</td>
                  <td className="currency-cell">R$ {item.revenue.toLocaleString()}</td>
                  <td className="percentage-cell">{item.payoutRate.toFixed(2)}%</td>
                  <td className="currency-cell">R$ {item.avgPayoutPerTransaction.toFixed(2)}</td>
                  <td>
                    <StatusBadge
                      status={item.status}
                      count={item.transactions}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn small">
                        <FiEye />
                      </button>
                      <button className="action-btn small success">
                        <FiDollarSign />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ValidationScreen;