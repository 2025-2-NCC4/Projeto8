import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - using fallback data');
      return Promise.resolve({ data: null });
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.code === 'ECONNRESET' || !error.response) {
      console.warn('Backend server not available, using fallback data:', error.message);
      return Promise.resolve({ data: null });
    }
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  async getGeneralStats(filters = {}) {
    try {
      const response = await api.get('/general-stats', { params: filters });
      return response.data || { totalTransactions: 0, totalRevenue: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0 };
    } catch (error) {
      console.error('Error fetching general stats:', error);
      return { totalTransactions: 0, totalRevenue: 0, totalCommission: 0, uniqueStores: 0, uniqueCustomers: 0 };
    }
  },

  async getTransactionsOverTime(filters = {}) {
    try {
      const response = await api.get('/transactions-over-time', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching transactions over time:', error);
      return [];
    }
  },

  async getTopCategories(filters = {}) {
    try {
      const response = await api.get('/top-categories', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching top categories:', error);
      return [];
    }
  },

  async getCouponDistribution(filters = {}) {
    try {
      const response = await api.get('/coupon-distribution', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching coupon distribution:', error);
      return [];
    }
  },

  async getRevenueByRegion(filters = {}) {
    try {
      const response = await api.get('/revenue-by-region', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching revenue by region:', error);
      return [];
    }
  },

  async getCustomerSegments(filters = {}) {
    try {
      const response = await api.get('/customer-segments', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      return [];
    }
  },

  async getTimeDistribution(filters = {}) {
    try {
      const response = await api.get('/time-distribution', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching time distribution:', error);
      return [];
    }
  },

  async getFilterOptions() {
    try {
      const response = await api.get('/filter-options');
      return response.data || { categorias: [], bairros: [], tiposCupom: [] };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return { categorias: [], bairros: [], tiposCupom: [] };
    }
  },

  async getPedestresHeatmap(showPenetracao = false, filters = {}) {
    try {
      const response = await api.get('/geographic/pedestres-heatmap', {
        params: { ...filters, show_penetracao: showPenetracao }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching pedestres heatmap:', error);
      return [];
    }
  },

  async getLojasLocations(filters = {}) {
    try {
      const response = await api.get('/geographic/lojas-locations', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lojas locations:', error);
      return [];
    }
  },

  async getPeakHours(filters = {}) {
    try {
      const response = await api.get('/time-analysis/peak-hours', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      return [];
    }
  },

  async getStoresPerformanceRanking(filters = {}) {
    try {
      const response = await api.get('/stores/performance-ranking', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching stores performance ranking:', error);
      return [];
    }
  },

  async getStatus() {
    try {
      const response = await api.get('/status');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching status:', error);
      return null;
    }
  },

  // Financial Analysis APIs
  async getOperatingMargin(filters = {}) {
    try {
      const response = await api.get('/financial/operating-margin', { params: filters });
      return response.data || { totalRevenue: 0, totalCosts: 0, operatingMargin: 0, monthlyData: [] };
    } catch (error) {
      console.error('Error fetching operating margin:', error);
      return { totalRevenue: 0, totalCosts: 0, operatingMargin: 0, monthlyData: [] };
    }
  },

  async getNetRevenue(filters = {}) {
    try {
      const response = await api.get('/financial/net-revenue', { params: filters });
      return response.data || { summary: { totalGrossRevenue: 0, totalCosts: 0, totalNetRevenue: 0, overallMargin: 0 }, byType: [] };
    } catch (error) {
      console.error('Error fetching net revenue:', error);
      return { summary: { totalGrossRevenue: 0, totalCosts: 0, totalNetRevenue: 0, overallMargin: 0 }, byType: [] };
    }
  },

  // Coupon Performance APIs
  async getCouponPerformanceByType(filters = {}) {
    try {
      const response = await api.get('/coupons/performance-by-type', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching coupon performance by type:', error);
      return [];
    }
  },

  async getCouponUsageTrends(filters = {}) {
    try {
      const response = await api.get('/coupons/usage-trends', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching coupon usage trends:', error);
      return [];
    }
  },

  // Temporal Analysis APIs
  async getDailyParticipation(filters = {}) {
    try {
      const response = await api.get('/temporal/daily-participation', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching daily participation:', error);
      return [];
    }
  },

  async getPeriodDistribution(filters = {}) {
    try {
      const response = await api.get('/temporal/period-distribution', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching period distribution:', error);
      return [];
    }
  },

  // Enhanced Categories APIs
  async getCategoriesDetailedAnalysis(filters = {}) {
    try {
      const response = await api.get('/categories/detailed-analysis', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories detailed analysis:', error);
      return [];
    }
  },

  // Validation and Payout APIs
  async getCouponSummary(filters = {}) {
    try {
      const response = await api.get('/validation/coupon-summary', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching coupon summary:', error);
      return [];
    }
  },

  async getPayoutTracking(filters = {}) {
    try {
      const response = await api.get('/validation/payout-tracking', { params: filters });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payout tracking:', error);
      return [];
    }
  }
};

export default api;