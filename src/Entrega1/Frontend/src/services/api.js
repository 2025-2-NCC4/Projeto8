import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const dashboardAPI = {

  async getGeneralStats(filters = {}) {
    const response = await api.get('/general-stats', { params: filters });
    return response.data;
  },


  async getTransactionsOverTime(filters = {}) {
    const response = await api.get('/transactions-over-time', { params: filters });
    return response.data;
  },


  async getTopCategories(filters = {}) {
    const response = await api.get('/top-categories', { params: filters });
    return response.data;
  },


  async getCouponDistribution(filters = {}) {
    const response = await api.get('/coupon-distribution', { params: filters });
    return response.data;
  },


  async getRevenueByRegion(filters = {}) {
    const response = await api.get('/revenue-by-region', { params: filters });
    return response.data;
  },


  async getCustomerSegments(filters = {}) {
    const response = await api.get('/customer-segments', { params: filters });
    return response.data;
  },


  async getTimeDistribution(filters = {}) {
    const response = await api.get('/time-distribution', { params: filters });
    return response.data;
  },


  async getFilterOptions() {
    const response = await api.get('/filter-options');
    return response.data;
  },




  async getPedestresHeatmap(showPenetracao = false, filters = {}) {
    const response = await api.get('/geographic/pedestres-heatmap', { 
      params: { ...filters, show_penetracao: showPenetracao } 
    });
    return response.data;
  },


  async getLojasLocations(filters = {}) {
    const response = await api.get('/geographic/lojas-locations', { params: filters });
    return response.data;
  },


  async getPeakHours(filters = {}) {
    const response = await api.get('/time-analysis/peak-hours', { params: filters });
    return response.data;
  },


  async getStoresPerformanceRanking(filters = {}) {
    const response = await api.get('/stores/performance-ranking', { params: filters });
    return response.data;
  },


  async getStatus() {
    const response = await api.get('/status');
    return response.data;
  },

  // Financial Analysis APIs
  async getOperatingMargin(filters = {}) {
    const response = await api.get('/financial/operating-margin', { params: filters });
    return response.data;
  },

  async getNetRevenue(filters = {}) {
    const response = await api.get('/financial/net-revenue', { params: filters });
    return response.data;
  },

  // Coupon Performance APIs
  async getCouponPerformanceByType(filters = {}) {
    const response = await api.get('/coupons/performance-by-type', { params: filters });
    return response.data;
  },

  async getCouponUsageTrends(filters = {}) {
    const response = await api.get('/coupons/usage-trends', { params: filters });
    return response.data;
  },

  // Temporal Analysis APIs
  async getDailyParticipation(filters = {}) {
    const response = await api.get('/temporal/daily-participation', { params: filters });
    return response.data;
  },

  async getPeriodDistribution(filters = {}) {
    const response = await api.get('/temporal/period-distribution', { params: filters });
    return response.data;
  },

  // Enhanced Categories APIs
  async getCategoriesDetailedAnalysis(filters = {}) {
    const response = await api.get('/categories/detailed-analysis', { params: filters });
    return response.data;
  },

  // Validation and Payout APIs
  async getCouponSummary(filters = {}) {
    const response = await api.get('/validation/coupon-summary', { params: filters });
    return response.data;
  },

  async getPayoutTracking(filters = {}) {
    const response = await api.get('/validation/payout-tracking', { params: filters });
    return response.data;
  }
};

export default api;