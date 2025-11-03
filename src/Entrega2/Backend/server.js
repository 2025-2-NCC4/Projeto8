import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import { format, parseISO, isWithinInterval, getHours } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(compression());
app.use(cors());

app.use(express.json());

// Health check endpoint para o Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

let cachedData = {
  transacoes: [],
  lojas: [],
  players: [],
  pedestres: [],
  lastUpdated: null
};

async function loadCSVData(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, 'datasets', filename);
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`Arquivo ${filename} não encontrado`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`✅ Carregados ${results.length} registros de ${filename}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

async function initializeData() {
  try {
    console.log('🔄 Carregando dados dos CSV...');
    
    const [transacoes, lojas, players, pedestres] = await Promise.all([
      loadCSVData('transacoes_cleaned.csv'),
      loadCSVData('lojas_cleaned.csv'),
      loadCSVData('players_cleaned.csv'),
      loadCSVData('pedestres_cleaned.csv')
    ]);

    const playersMap = new Map(players.map(p => [p.celular, p]));

    
    const enrichedTransacoes = transacoes.map(t => {
      const player = playersMap.get(t.celular);
      if (player) {
        return { ...t, ...player };
      }
      return t;
    });

    cachedData = {
      transacoes: enrichedTransacoes,
      lojas,
      players,
      pedestres,
      lastUpdated: new Date()
    };

    console.log('✅ Dados carregados com sucesso!');
    console.log(`📊 Total de transações: ${enrichedTransacoes.length}`);
    console.log(`🏪 Total de lojas: ${lojas.length}`);
    console.log(`👥 Total de players: ${players.length}`);
    console.log(`🚶 Total de pedestres: ${pedestres.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error.message);
    process.exit(1);
  }
}

function filterTransactionsByDate(transactions, startDate, endDate) {
  if (!startDate && !endDate) return transactions;
  
  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;

  return transactions.filter(transaction => {
    try {
      const transactionDate = parseISO(transaction.data);
      if (start && end) {
        return isWithinInterval(transactionDate, { start, end });
      } else if (start) {
        return transactionDate >= start;
      } else if (end) {
        return transactionDate <= end;
      }
    } catch (e) {
      return false;
    }
    return true;
  });
}

function applyFilters(transactions, filters) {
  let filteredData = [...transactions];
  
  if (filters.startDate || filters.endDate) {
    filteredData = filterTransactionsByDate(filteredData, filters.startDate, filters.endDate);
  }
  
  if (filters.categoria) {
    filteredData = filteredData.filter(t => t.categoria_estabelecimento && t.categoria_estabelecimento.toLowerCase().includes(filters.categoria.toLowerCase()));
  }
  
  if (filters.bairro) {
    filteredData = filteredData.filter(t => t.bairro_estabelecimento && t.bairro_estabelecimento.toLowerCase().includes(filters.bairro.toLowerCase()));
  }
  
  if (filters.tipoCupom) {
    const types = filters.tipoCupom.toLowerCase().split(',');
    filteredData = filteredData.filter(t => t.tipo_cupom && types.includes(t.tipo_cupom.toLowerCase()));
  }

  if (filters.gender && filters.gender !== 'Todos') {
    filteredData = filteredData.filter(t => t.sexo && t.sexo.toLowerCase() === filters.gender.toLowerCase());
  }

  if (filters.ageRange) {
    const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
    filteredData = filteredData.filter(t => {
      const age = parseInt(t.idade, 10);
      if (isNaN(age)) return false;
      if (maxAge) {
        return age >= minAge && age <= maxAge;
      } else {
        return age >= minAge;
      }
    });
  }

  if (filters.deviceType && filters.deviceType !== 'Todos') {
  }

  if (filters.minValue) {
    filteredData = filteredData.filter(t => parseFloat(t.valor_cupom) >= parseFloat(filters.minValue));
  }

  if (filters.maxValue) {
    filteredData = filteredData.filter(t => parseFloat(t.valor_cupom) <= parseFloat(filters.maxValue));
  }
  
  return filteredData;
}

app.get('/api/general-stats', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const totalTransactions = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.valor_cupom || 0), 0);
    const avgTicket = totalRevenue / totalTransactions || 0;
    const totalCommission = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.repasse_picmoney || 0), 0);
    
    const uniqueStores = new Set(filteredTransactions.map(t => t.nome_estabelecimento)).size;
    const uniqueCustomers = new Set(filteredTransactions.map(t => t.celular)).size;
    
    res.json({
      totalTransactions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgTicket: Math.round(avgTicket * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      uniqueStores,
      uniqueCustomers
    });
  } catch (error) {
    console.error('Erro em general-stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/transactions-over-time', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const groupedByDate = filteredTransactions.reduce((acc, transaction) => {
      const date = transaction.data;
      if (!acc[date]) {
        acc[date] = { 
          data: date, 
          transacoes: 0, 
          valor: 0,
          receita_picmoney: 0,
          usuarios_ativos: new Set()
        };
      }
      acc[date].transacoes += 1;
      acc[date].valor += parseFloat(transaction.valor_cupom || 0);
      acc[date].receita_picmoney += parseFloat(transaction.repasse_picmoney || 0);
      acc[date].usuarios_ativos.add(transaction.celular);
      return acc;
    }, {});
    
    const result = Object.values(groupedByDate)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .map(item => ({ 
        ...item, 
        valor: Math.round(item.valor * 100) / 100,
        receita_picmoney: Math.round(item.receita_picmoney * 100) / 100,
        usuarios_ativos: item.usuarios_ativos.size
      }));
    
    res.json(result);
  } catch (error) {
    console.error('Erro em transactions-over-time:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/geographic/pedestres-heatmap', (req, res) => {
  try {
    const { show_penetracao } = req.query;
    
    let pedestresData = cachedData.pedestres;
    
    if (show_penetracao === 'true') {
      pedestresData = pedestresData.filter(p => p.possui_app_picmoney === 'True');
    }
    
    const heatmapData = pedestresData.map(p => ({
      latitude: parseFloat(p.latitude),
      longitude: parseFloat(p.longitude),
      peso: 1,
      local: p.local,
      possui_app: p.possui_app_picmoney === 'True',
      data: p.data,
      horario: p.horario
    })).filter(p => !isNaN(p.latitude) && !isNaN(p.longitude));
    
    res.json(heatmapData);
  } catch (error) {
    console.error('Erro em pedestres-heatmap:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/geographic/lojas-locations', (req, res) => {
  try {
    const lojasData = cachedData.lojas.map(loja => ({
      nome: loja.nome_loja,
      endereco: loja.endereco_loja,
      latitude: parseFloat(loja.latitude),
      longitude: parseFloat(loja.longitude),
      categoria: loja.tipo_loja || 'Não informado'
    })).filter(loja => !isNaN(loja.latitude) && !isNaN(loja.longitude));
    
    res.json(lojasData);
  } catch (error) {
    console.error('Erro em lojas-locations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/time-analysis/peak-hours', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const heatmapMatrix = {};
    const diasSemana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    diasSemana.forEach(dia => {
      heatmapMatrix[dia] = {};
      for (let hora = 0; hora < 24; hora++) {
        heatmapMatrix[dia][hora] = 0;
      }
    });
    
    filteredTransactions.forEach(t => {
      try {
        const date = parseISO(t.data);
        const hora = parseInt(t.hora.split(':')[0]);
        const diaSemana = format(date, 'EEEE');
        
        if (heatmapMatrix[diaSemana] && hora >= 0 && hora < 24) {
          heatmapMatrix[diaSemana][hora]++;
        }
      } catch (e) {
      }
    });
    
    
    const result = diasSemana.map(dia => ({
      dia,
      horarios: Array.from({length: 24}, (_, hora) => ({
        hora,
        cupons: heatmapMatrix[dia][hora]
      }))
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Erro em peak-hours:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/stores/performance-ranking', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const storeStats = filteredTransactions.reduce((acc, transaction) => {
      const storeName = transaction.nome_estabelecimento || 'Não informado';
      const storeCategory = transaction.categoria_estabelecimento || 'Não informado';
      
      if (!acc[storeName]) {
        acc[storeName] = {
          nome_loja: storeName,
          categoria: storeCategory,
          receita_gerada: 0,
          cupons_capturados: 0,
          valores_cupom: []
        };
      }
      
      acc[storeName].receita_gerada += parseFloat(transaction.repasse_picmoney || 0);
      acc[storeName].cupons_capturados++;
      acc[storeName].valores_cupom.push(parseFloat(transaction.valor_cupom || 0));
      
      return acc;
    }, {});
    
    const result = Object.values(storeStats)
      .map((store, index) => ({
        posicao: index + 1,
        nome_loja: store.nome_loja,
        categoria: store.categoria,
        receita_gerada: Math.round(store.receita_gerada * 100) / 100,
        cupons_capturados: store.cupons_capturados,
        ticket_medio: Math.round((store.valores_cupom.reduce((sum, val) => sum + val, 0) / store.valores_cupom.length || 0) * 100) / 100
      }))
      .sort((a, b) => b.receita_gerada - a.receita_gerada)
      .map((store, index) => ({ ...store, posicao: index + 1 }));
    
    res.json(result);
  } catch (error) {
    console.error('Erro em performance-ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/top-categories', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const categoryStats = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.categoria_estabelecimento || 'Não informado';
      if (!acc[category]) {
        acc[category] = { categoria: category, transacoes: 0, valor: 0 };
      }
      acc[category].transacoes += 1;
      acc[category].valor += parseFloat(transaction.valor_cupom || 0);
      return acc;
    }, {});
    
    const result = Object.values(categoryStats)
      .map(item => ({ ...item, valor: Math.round(item.valor * 100) / 100 }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
    
    res.json(result);
  } catch (error) {
    console.error('Erro em top-categories:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/coupon-distribution', (req, res) => {
  console.log('Received request for /api/coupon-distribution');
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    
    const couponStats = filteredTransactions.reduce((acc, transaction) => {
      const couponType = transaction.tipo_cupom || 'Não informado';
      if (!acc[couponType]) {
        acc[couponType] = { tipo: couponType, quantidade: 0, valor: 0 };
      }
      acc[couponType].quantidade += 1;
      acc[couponType].valor += parseFloat(transaction.valor_cupom || 0);
      return acc;
    }, {});
    
    const total = filteredTransactions.length;
    const result = Object.values(couponStats).map(item => ({
      tipo: item.tipo,
      quantidade: item.quantidade,
      valor: Math.round(item.valor * 100) / 100,
      percentual: total > 0 ? Math.round((item.quantidade / total) * 100) : 0
    }));
    
    console.log('Successfully processed /api/coupon-distribution');
    res.json(result);
  } catch (error) {
    console.error('Erro em coupon-distribution:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/revenue-by-region', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    const revenueByRegion = filteredTransactions.reduce((acc, t) => {
      const region = t.bairro_estabelecimento || 'Não informado';
      if (!acc[region]) {
        acc[region] = { name: region, revenue: 0 };
      }
      acc[region].revenue += parseFloat(t.valor_cupom || 0);
      return acc;
    }, {});

    const result = Object.values(revenueByRegion)
      .map(r => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json(result);
  } catch (error) {
    console.error('Erro em revenue-by-region:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/customer-segments', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    const segments = filteredTransactions.map(t => ({
      age: parseInt(t.idade, 10) || 0,
      avgTicket: parseFloat(t.valor_cupom) || 0,
      gender: t.sexo || 'Não informado'
    }));
    res.json(segments);
  } catch (error) {
    console.error('Erro em customer-segments:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/time-distribution', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);
    const timeDistribution = filteredTransactions.reduce((acc, t) => {
      try {
        const hour = getHours(parseISO(t.data_transacao));
        acc[hour] = (acc[hour] || 0) + 1;
      } catch (e) {}
      return acc;
    }, {});

    const result = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      transactions: timeDistribution[i] || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro em time-distribution:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/filter-options', (req, res) => {
  try {
    const categorias = [...new Set(cachedData.transacoes.map(t => t.categoria_estabelecimento))].filter(Boolean).sort();
    const bairros = [...new Set(cachedData.transacoes.map(t => t.bairro_estabelecimento))].filter(Boolean).sort();
    const tiposCupom = [...new Set(cachedData.transacoes.map(t => t.tipo_cupom))].filter(Boolean).sort();
    
    res.json({ categorias, bairros, tiposCupom });
  } catch (error) {
    console.error('Erro em filter-options:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Financial Analysis Endpoints
app.get('/api/financial/operating-margin', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.valor_cupom || 0), 0);
    const totalCosts = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.repasse_picmoney || 0), 0);
    const operatingMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    // Monthly breakdown
    const monthlyData = filteredTransactions.reduce((acc, transaction) => {
      const month = transaction.data.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { revenue: 0, costs: 0, transactions: 0 };
      }
      acc[month].revenue += parseFloat(transaction.valor_cupom || 0);
      acc[month].costs += parseFloat(transaction.repasse_picmoney || 0);
      acc[month].transactions += 1;
      return acc;
    }, {});

    const monthlyMargins = Object.keys(monthlyData).map(month => ({
      month,
      revenue: Math.round(monthlyData[month].revenue * 100) / 100,
      costs: Math.round(monthlyData[month].costs * 100) / 100,
      margin: monthlyData[month].revenue > 0 ?
        Math.round(((monthlyData[month].revenue - monthlyData[month].costs) / monthlyData[month].revenue) * 10000) / 100 : 0,
      transactions: monthlyData[month].transactions
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      operatingMargin: Math.round(operatingMargin * 100) / 100,
      monthlyData: monthlyMargins
    });
  } catch (error) {
    console.error('Erro em operating-margin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/financial/net-revenue', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const revenueByType = filteredTransactions.reduce((acc, transaction) => {
      const type = transaction.tipo_cupom || 'Não informado';
      if (!acc[type]) {
        acc[type] = { gross: 0, costs: 0, transactions: 0 };
      }
      acc[type].gross += parseFloat(transaction.valor_cupom || 0);
      acc[type].costs += parseFloat(transaction.repasse_picmoney || 0);
      acc[type].transactions += 1;
      return acc;
    }, {});

    const netRevenueData = Object.keys(revenueByType).map(type => ({
      type,
      grossRevenue: Math.round(revenueByType[type].gross * 100) / 100,
      costs: Math.round(revenueByType[type].costs * 100) / 100,
      netRevenue: Math.round((revenueByType[type].gross - revenueByType[type].costs) * 100) / 100,
      transactions: revenueByType[type].transactions,
      margin: revenueByType[type].gross > 0 ?
        Math.round(((revenueByType[type].gross - revenueByType[type].costs) / revenueByType[type].gross) * 10000) / 100 : 0
    })).sort((a, b) => b.netRevenue - a.netRevenue);

    const totalGross = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.valor_cupom || 0), 0);
    const totalCosts = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.repasse_picmoney || 0), 0);
    const totalNet = totalGross - totalCosts;

    res.json({
      summary: {
        totalGrossRevenue: Math.round(totalGross * 100) / 100,
        totalCosts: Math.round(totalCosts * 100) / 100,
        totalNetRevenue: Math.round(totalNet * 100) / 100,
        overallMargin: totalGross > 0 ? Math.round((totalNet / totalGross) * 10000) / 100 : 0
      },
      byType: netRevenueData
    });
  } catch (error) {
    console.error('Erro em net-revenue:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Coupon Performance Analysis Endpoints
app.get('/api/coupons/performance-by-type', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const performanceByType = filteredTransactions.reduce((acc, transaction) => {
      const type = transaction.tipo_cupom || 'Não informado';
      if (!acc[type]) {
        acc[type] = {
          totalValue: 0,
          totalTransactions: 0,
          totalCommission: 0,
          uniqueCustomers: new Set(),
          uniqueStores: new Set()
        };
      }
      acc[type].totalValue += parseFloat(transaction.valor_cupom || 0);
      acc[type].totalTransactions += 1;
      acc[type].totalCommission += parseFloat(transaction.repasse_picmoney || 0);
      acc[type].uniqueCustomers.add(transaction.celular);
      acc[type].uniqueStores.add(transaction.nome_estabelecimento);
      return acc;
    }, {});

    const performanceData = Object.keys(performanceByType).map(type => {
      const data = performanceByType[type];
      return {
        type,
        totalValue: Math.round(data.totalValue * 100) / 100,
        totalTransactions: data.totalTransactions,
        avgTicket: Math.round((data.totalValue / data.totalTransactions) * 100) / 100,
        totalCommission: Math.round(data.totalCommission * 100) / 100,
        commissionRate: data.totalValue > 0 ?
          Math.round((data.totalCommission / data.totalValue) * 10000) / 100 : 0,
        uniqueCustomers: data.uniqueCustomers.size,
        uniqueStores: data.uniqueStores.size,
        efficiency: data.totalTransactions > 0 ?
          Math.round((data.totalValue / data.totalTransactions) * 100) / 100 : 0
      };
    }).sort((a, b) => b.totalValue - a.totalValue);

    res.json(performanceData);
  } catch (error) {
    console.error('Erro em performance-by-type:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/coupons/usage-trends', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const dailyUsage = filteredTransactions.reduce((acc, transaction) => {
      const date = transaction.data;
      const type = transaction.tipo_cupom || 'Não informado';

      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][type]) {
        acc[date][type] = { count: 0, value: 0 };
      }

      acc[date][type].count += 1;
      acc[date][type].value += parseFloat(transaction.valor_cupom || 0);
      return acc;
    }, {});

    const trendData = Object.keys(dailyUsage).sort().map(date => {
      const dayData = { date };
      const types = Object.keys(dailyUsage[date]);

      types.forEach(type => {
        dayData[`${type}_count`] = dailyUsage[date][type].count;
        dayData[`${type}_value`] = Math.round(dailyUsage[date][type].value * 100) / 100;
      });

      return dayData;
    });

    res.json(trendData);
  } catch (error) {
    console.error('Erro em usage-trends:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Temporal Analysis Endpoints
app.get('/api/temporal/daily-participation', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const dailyStats = filteredTransactions.reduce((acc, transaction) => {
      const date = transaction.data;
      if (!acc[date]) {
        acc[date] = {
          totalTransactions: 0,
          totalValue: 0,
          uniqueCustomers: new Set(),
          uniqueStores: new Set()
        };
      }
      acc[date].totalTransactions += 1;
      acc[date].totalValue += parseFloat(transaction.valor_cupom || 0);
      acc[date].uniqueCustomers.add(transaction.celular);
      acc[date].uniqueStores.add(transaction.nome_estabelecimento);
      return acc;
    }, {});

    const participationData = Object.keys(dailyStats).sort().map(date => ({
      date,
      transactions: dailyStats[date].totalTransactions,
      revenue: Math.round(dailyStats[date].totalValue * 100) / 100,
      avgTicket: Math.round((dailyStats[date].totalValue / dailyStats[date].totalTransactions) * 100) / 100,
      uniqueCustomers: dailyStats[date].uniqueCustomers.size,
      uniqueStores: dailyStats[date].uniqueStores.size,
      participationRate: Math.round((dailyStats[date].uniqueCustomers.size / dailyStats[date].totalTransactions) * 10000) / 100
    }));

    res.json(participationData);
  } catch (error) {
    console.error('Erro em daily-participation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/temporal/period-distribution', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const periodStats = filteredTransactions.reduce((acc, transaction) => {
      const hour = parseInt(transaction.hora?.split(':')[0] || '0', 10);
      let period;

      if (hour >= 6 && hour < 12) period = 'Manhã';
      else if (hour >= 12 && hour < 18) period = 'Tarde';
      else if (hour >= 18 && hour < 24) period = 'Noite';
      else period = 'Madrugada';

      if (!acc[period]) {
        acc[period] = {
          transactions: 0,
          value: 0,
          customers: new Set()
        };
      }

      acc[period].transactions += 1;
      acc[period].value += parseFloat(transaction.valor_cupom || 0);
      acc[period].customers.add(transaction.celular);
      return acc;
    }, {});

    const distributionData = Object.keys(periodStats).map(period => ({
      period,
      transactions: periodStats[period].transactions,
      revenue: Math.round(periodStats[period].value * 100) / 100,
      avgTicket: Math.round((periodStats[period].value / periodStats[period].transactions) * 100) / 100,
      uniqueCustomers: periodStats[period].customers.size,
      percentage: Math.round((periodStats[period].transactions / filteredTransactions.length) * 10000) / 100
    }));

    res.json(distributionData);
  } catch (error) {
    console.error('Erro em period-distribution:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enhanced Categories Analysis
app.get('/api/categories/detailed-analysis', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.valor_cupom || 0), 0);
    const totalTransactions = filteredTransactions.length;

    const categoryStats = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.categoria_estabelecimento || 'Não informado';
      if (!acc[category]) {
        acc[category] = {
          revenue: 0,
          transactions: 0,
          stores: new Set(),
          customers: new Set(),
          commission: 0
        };
      }

      acc[category].revenue += parseFloat(transaction.valor_cupom || 0);
      acc[category].transactions += 1;
      acc[category].stores.add(transaction.nome_estabelecimento);
      acc[category].customers.add(transaction.celular);
      acc[category].commission += parseFloat(transaction.repasse_picmoney || 0);
      return acc;
    }, {});

    const detailedAnalysis = Object.keys(categoryStats)
      .map(category => {
        const stats = categoryStats[category];
        return {
          category,
          revenue: Math.round(stats.revenue * 100) / 100,
          transactions: stats.transactions,
          avgTicket: Math.round((stats.revenue / stats.transactions) * 100) / 100,
          uniqueStores: stats.stores.size,
          uniqueCustomers: stats.customers.size,
          commission: Math.round(stats.commission * 100) / 100,
          revenueParticipation: Math.round((stats.revenue / totalRevenue) * 10000) / 100,
          transactionParticipation: Math.round((stats.transactions / totalTransactions) * 10000) / 100,
          efficiency: Math.round((stats.revenue / stats.transactions) * 100) / 100
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    res.json(detailedAnalysis);
  } catch (error) {
    console.error('Erro em detailed-analysis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validation and Payout Management Endpoints
app.get('/api/validation/coupon-summary', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const summary = filteredTransactions.reduce((acc, transaction) => {
      const type = transaction.tipo_cupom || 'Não informado';
      const status = 'Validado'; // Assuming all transactions in CSV are validated

      if (!acc[type]) {
        acc[type] = {
          total: 0,
          validated: 0,
          pending: 0,
          revenue: 0,
          payout: 0
        };
      }

      acc[type].total += 1;
      acc[type].validated += 1; // All are considered validated
      acc[type].revenue += parseFloat(transaction.valor_cupom || 0);
      acc[type].payout += parseFloat(transaction.repasse_picmoney || 0);
      return acc;
    }, {});

    const validationData = Object.keys(summary).map(type => ({
      type,
      totalCoupons: summary[type].total,
      validatedCoupons: summary[type].validated,
      pendingCoupons: summary[type].pending,
      validationRate: Math.round((summary[type].validated / summary[type].total) * 10000) / 100,
      totalRevenue: Math.round(summary[type].revenue * 100) / 100,
      totalPayout: Math.round(summary[type].payout * 100) / 100,
      avgCouponValue: Math.round((summary[type].revenue / summary[type].total) * 100) / 100
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(validationData);
  } catch (error) {
    console.error('Erro em coupon-summary:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/validation/payout-tracking', (req, res) => {
  try {
    const filteredTransactions = applyFilters(cachedData.transacoes, req.query);

    const monthlyPayouts = filteredTransactions.reduce((acc, transaction) => {
      const month = transaction.data.substring(0, 7); // YYYY-MM
      const store = transaction.nome_estabelecimento || 'Não informado';

      if (!acc[month]) {
        acc[month] = {};
      }
      if (!acc[month][store]) {
        acc[month][store] = {
          totalPayout: 0,
          transactions: 0,
          revenue: 0
        };
      }

      acc[month][store].totalPayout += parseFloat(transaction.repasse_picmoney || 0);
      acc[month][store].transactions += 1;
      acc[month][store].revenue += parseFloat(transaction.valor_cupom || 0);
      return acc;
    }, {});

    const payoutData = [];
    Object.keys(monthlyPayouts).sort().forEach(month => {
      Object.keys(monthlyPayouts[month]).forEach(store => {
        const data = monthlyPayouts[month][store];
        payoutData.push({
          month,
          store,
          totalPayout: Math.round(data.totalPayout * 100) / 100,
          transactions: data.transactions,
          revenue: Math.round(data.revenue * 100) / 100,
          payoutRate: data.revenue > 0 ?
            Math.round((data.totalPayout / data.revenue) * 10000) / 100 : 0,
          avgPayoutPerTransaction: Math.round((data.totalPayout / data.transactions) * 100) / 100,
          status: 'Pago' // Assuming all are paid
        });
      });
    });

    res.json(payoutData.sort((a, b) => b.totalPayout - a.totalPayout));
  } catch (error) {
    console.error('Erro em payout-tracking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataLoaded: cachedData.lastUpdated !== null,
    lastUpdated: cachedData.lastUpdated,
    records: {
      transacoes: cachedData.transacoes.length,
      lojas: cachedData.lojas.length,
      players: cachedData.players.length,
      pedestres: cachedData.pedestres.length
    }
  });
});
app.get('/api/alerts/settings', (req, res) => {
  res.json(alertSettings);
});

app.post('/api/alerts/settings', (req, res) => {
  const { minRevenue, maxCouponUsagePercent } = req.body;

  if (minRevenue !== undefined) {
    alertSettings.minRevenue = parseFloat(minRevenue);
  }
  if (maxCouponUsagePercent !== undefined) {
    alertSettings.maxCouponUsagePercent = parseFloat(maxCouponUsagePercent);
  }

  console.log('Configurações de alerta atualizadas:', alertSettings);
  res.json({ success: true, settings: alertSettings });
});

app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

async function startServer() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Dashboard API disponível em http://localhost:${PORT}/api`);
  });
}

startServer().catch(error => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
