
export const mockData = {
  generalStats: {
    totalCommission: 285000,
    uniqueStores: 147,
    totalTransactions: 8534,
    uniqueCustomers: 3492,
    totalRevenue: 4567890
  },

  transactionsOverTime: [
    { data: '2025-07-01', receita_picmoney: 42000, usuarios_ativos: 320 },
    { data: '2025-07-05', receita_picmoney: 48000, usuarios_ativos: 380 },
    { data: '2025-07-10', receita_picmoney: 52000, usuarios_ativos: 420 },
    { data: '2025-07-15', receita_picmoney: 45000, usuarios_ativos: 350 },
    { data: '2025-07-20', receita_picmoney: 58000, usuarios_ativos: 480 },
    { data: '2025-07-25', receita_picmoney: 62000, usuarios_ativos: 520 },
    { data: '2025-07-30', receita_picmoney: 68000, usuarios_ativos: 580 }
  ],

  topCategories: [
    { categoria: 'Alimentação', valor: 125000 },
    { categoria: 'Moda', valor: 98000 },
    { categoria: 'Eletrônicos', valor: 87000 },
    { categoria: 'Casa e Jardim', valor: 65000 },
    { categoria: 'Saúde', valor: 54000 },
    { categoria: 'Esportes', valor: 42000 }
  ],

  couponDistribution: [
    { tipo: 'Desconto %', valor: 45 },
    { tipo: 'Valor Fixo', valor: 30 },
    { tipo: 'Frete Grátis', valor: 15 },
    { tipo: 'Cashback', valor: 10 }
  ],

  pedestresHeatmap: Array.from({ length: 50 }, (_, i) => ({
    latitude: -23.550520 + (Math.random() - 0.5) * 0.1,
    longitude: -46.633308 + (Math.random() - 0.5) * 0.1,
    possui_app: Math.random() > 0.3
  })),

  lojasLocations: Array.from({ length: 20 }, (_, i) => ({
    nome: `Loja ${i + 1}`,
    endereco: `Endereço ${i + 1}`,
    latitude: -23.550520 + (Math.random() - 0.5) * 0.08,
    longitude: -46.633308 + (Math.random() - 0.5) * 0.08
  })),

  peakHours: [
    {
      dia: 'Monday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 30 : 5)
      }))
    },
    {
      dia: 'Tuesday', 
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 25 : 3)
      }))
    },
    {
      dia: 'Wednesday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 35 : 8)
      }))
    },
    {
      dia: 'Thursday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 28 : 6)
      }))
    },
    {
      dia: 'Friday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 40 : 12)
      }))
    },
    {
      dia: 'Saturday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 50) + (hour >= 10 && hour <= 20 ? 45 : 15)
      }))
    },
    {
      dia: 'Sunday',
      horarios: Array.from({ length: 24 }, (_, hour) => ({
        hora: hour,
        cupons: Math.floor(Math.random() * 30) + (hour >= 10 && hour <= 18 ? 25 : 8)
      }))
    }
  ],

  customerSegments: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    age: Math.floor(Math.random() * 50) + 18,
    gender: Math.random() > 0.5 ? 'M' : 'F'
  })),

  storesPerformance: Array.from({ length: 50 }, (_, i) => ({
    posicao: i + 1,
    nome_loja: `Loja ${String.fromCharCode(65 + (i % 26))} ${Math.floor(i / 26) + 1}`,
    categoria: ['Alimentação', 'Moda', 'Eletrônicos', 'Casa e Jardim', 'Saúde'][i % 5],
    receita_gerada: Math.floor(Math.random() * 50000) + 10000,
    cupons_capturados: Math.floor(Math.random() * 500) + 50,
    ticket_medio: Math.floor(Math.random() * 200) + 50
  })),

  filterOptions: {
    categorias: ['Alimentação', 'Moda', 'Eletrônicos', 'Casa e Jardim', 'Saúde', 'Esportes'],
    bairros: ['Centro', 'Vila Madalena', 'Pinheiros', 'Jardins', 'Moema', 'Itaim'],
    tiposCupom: ['Desconto %', 'Valor Fixo', 'Frete Grátis', 'Cashback'],
    faixasEtarias: ['18-24', '25-34', '35-44', '45-54', '55+'],
    generos: ['M', 'F'],
    tiposDispositivo: ['Mobile', 'Desktop', 'Tablet']
  }
};


export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));