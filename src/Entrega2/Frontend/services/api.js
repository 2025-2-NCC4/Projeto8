import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

const cleanFilters = (filters) => {
  const cleaned = {};
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

export const dashboardAPI = {
  getGeneralStats: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/general-stats', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar estatísticas gerais: ' + error.message);
    }
  },

  getTransactionsOverTime: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/transactions-over-time', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar evolução das transações: ' + error.message);
    }
  },

  getTopCategories: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/top-categories', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar top categorias: ' + error.message);
    }
  },

  getCouponDistribution: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/coupon-distribution', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar distribuição de cupons: ' + error.message);
    }
  },

  getFilterOptions: async () => {
    try {
      const response = await api.get('/filter-options');
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar opções de filtros: ' + error.message);
    }
  },

  getRevenueByRegion: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/revenue-by-region', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('Revenue by region endpoint not available');
      return [];
    }
  },

  getCustomerSegments: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/customer-segments', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('Customer segments endpoint not available');
      return [];
    }
  },

  getTimeDistribution: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/time-distribution', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('Time distribution endpoint not available');
      return [];
    }
  },

  getGeographicData: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/geographic-data', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('Geographic data endpoint not available');
      return [];
    }
  },

  getDemographicData: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/demographic-data', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('Demographic data endpoint not available');
      return [];
    }
  },

  getROIData: async (filters = {}) => {
    try {
      const cleanedFilters = cleanFilters(filters);
      const response = await api.get('/roi-data', { params: cleanedFilters });
      return response.data;
    } catch (error) {
      console.warn('ROI data endpoint not available');
      return [];
    }
  }
};
// Dentro do seu endpoint /api/kpis
const kpis = {
  totalRevenue: 5000, // (valor calculado)
  couponUsage: 60, // (valor calculado)
  // ...
};

// Adiciona lógica de alerta
const kpiResponse = {
  totalRevenue: {
    value: kpis.totalRevenue,
    status: kpis.totalRevenue < alertSettings.minRevenue ? 'alert' : 'normal'
  },
  couponUsage: {
    value: kpis.couponUsage,
    status: kpis.couponUsage > alertSettings.maxCouponUsagePercent ? 'alert' : 'normal'
  },
  // ...
};

res.json(kpiResponse);

export default api;