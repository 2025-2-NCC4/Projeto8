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
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

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
