import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMapPin, 
  FiUsers, 
  FiShoppingBag, 
  FiTrendingUp,
  FiTarget,
  FiBarChart,
  FiLayers,
  FiMap,
  FiZoomIn
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardAPI } from '../services/api';
import './GeographicAnalysis.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'];

const GeographicOverview = ({ data }) => {

  const neighborhoodData = [
    { nome: 'Centro', pedestres: 1250, comApp: 420, lojas: 8, receita: 12500 },
    { nome: 'Copacabana', pedestres: 980, comApp: 350, lojas: 6, receita: 9800 },
    { nome: 'Ipanema', pedestres: 850, comApp: 290, lojas: 5, receita: 8200 },
    { nome: 'Leblon', pedestres: 720, comApp: 280, lojas: 4, receita: 7500 },
    { nome: 'Botafogo', pedestres: 650, comApp: 200, lojas: 3, receita: 5800 }
  ];

  return (
    <div className="geographic-overview">
      <div className="overview-header">
        <FiMap size={24} />
        <h3>Visão por Região</h3>
      </div>
      <div className="geographic-cards">
        {neighborhoodData.map((region, index) => {
          const penetracao = ((region.comApp / region.pedestres) * 100).toFixed(1);
          return (
            <div key={region.nome} className="region-card">
              <div className="region-header">
                <h4>{region.nome}</h4>
                <div className="penetration-badge">{penetracao}%</div>
              </div>
              <div className="region-metrics">
                <div className="region-metric">
                  <FiUsers size={16} />
                  <span>{region.pedestres.toLocaleString()} pedestres</span>
                </div>
                <div className="region-metric">
                  <FiMapPin size={16} />
                  <span>{region.comApp.toLocaleString()} com app</span>
                </div>
                <div className="region-metric">
                  <FiShoppingBag size={16} />
                  <span>{region.lojas} lojas</span>
                </div>
                <div className="region-metric revenue">
                  <span>R$ {region.receita.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RegionalPerformanceChart = ({ data }) => {
  const chartData = [
    { regiao: 'Centro', pedestres: 1250, penetracao: 33.6, receita: 12500 },
    { regiao: 'Copacabana', pedestres: 980, penetracao: 35.7, receita: 9800 },
    { regiao: 'Ipanema', pedestres: 850, penetracao: 34.1, receita: 8200 },
    { regiao: 'Leblon', pedestres: 720, penetracao: 38.9, receita: 7500 },
    { regiao: 'Botafogo', pedestres: 650, penetracao: 30.8, receita: 5800 }
  ];

  return (
    <div className="regional-chart">
      <div className="chart-header">
        <FiBarChart size={24} />
        <h3>Performance por Região</h3>
      </div>
      <ResponsiveContainer width="100%" height={550}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="regiao" fontSize={12} />
          <YAxis yAxisId="pedestres" orientation="left" fontSize={12} />
          <YAxis yAxisId="penetracao" orientation="right" fontSize={12} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'Pedestres') return [value.toLocaleString(), 'Pedestres'];
              if (name === 'Penetração') return [`${value}%`, 'Penetração do App'];
              return [value, name];
            }}
          />
          <Bar yAxisId="pedestres" dataKey="pedestres" name="Pedestres" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="penetracao" dataKey="penetracao" name="Penetração" fill="#FFC107" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const OpportunityMetrics = ({ pedestresData, lojasData }) => {

  const totalPedestres = 4450;
  const comApp = 1540;
  const semApp = totalPedestres - comApp;
  const penetracao = (comApp / totalPedestres * 100);
  const totalLojas = 26;

  return (
    <div className="opportunity-metrics">
      <div className="metrics-header">
        <FiBarChart size={24} />
        <h3>Métricas Geográficas</h3>
      </div>
      <div className="metrics-cards">
        <div className="metric-card">
          <div className="metric-icon"><FiUsers size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Total de Pedestres</div>
            <div className="metric-value">{totalPedestres.toLocaleString('pt-BR')}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiMapPin size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Com App PicMoney</div>
            <div className="metric-value">{comApp.toLocaleString('pt-BR')}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiTrendingUp size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Taxa de Penetração</div>
            <div className="metric-value">{penetracao.toFixed(1)}%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiShoppingBag size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Lojas Parceiras</div>
            <div className="metric-value">{totalLojas.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>
      <div className="opportunity-analysis">
        <div className="opportunity-header">
          <FiTarget size={20} />
          <h4>Análise de Oportunidades</h4>
        </div>
        <div className="opportunity-cards">
          <div className="opportunity-card">
            <h5>Potencial de Usuários</h5>
            <div className="opportunity-value">{semApp.toLocaleString('pt-BR')}</div>
            <p>Pedestres na área que ainda não têm o app.</p>
          </div>
          <div className="opportunity-card">
            <h5>Receita Potencial/Mês</h5>
            <div className="opportunity-value">
              R$ {(semApp * 0.15 * 50).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p>Estimativa com 15% de conversão e gasto médio.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GeographicAnalysis = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <div className="loading">Carregando análise geográfica...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <motion.div 
      className="geographic-analysis-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div className="page-title">
          <FiLayers size={32} />
          <h1>Inteligência de Mercado</h1>
        </div>
        <p>Análise geográfica de performance regional, penetração do aplicativo e oportunidades de expansão.</p>
      </div>

      <div className="geographic-main-layout">
        <GeographicOverview />
        
        <div className="geographic-analytics-grid">
          <RegionalPerformanceChart />
          <OpportunityMetrics />
        </div>
      </div>

      <div className="strategic-recommendations">
        <div className="recommendations-header">
          <FiTarget size={24} />
          <h3>Recomendações Estratégicas Baseadas em Dados</h3>
        </div>
        <div className="recommendations-grid">
          <div className="recommendation-card priority-high">
            <h4 className="priority-title high">Alta Prioridade</h4>
            <p><strong>Centro & Copacabana:</strong> Concentre esforços de expansão nessas regiões com maior volume de pedestres e receita comprovada. Alto potencial de ROI.</p>
          </div>
          <div className="recommendation-card priority-medium">
            <h4 className="priority-title medium">Média Prioridade</h4>
            <p><strong>Leblon & Ipanema:</strong> Apesar do menor volume, têm alta penetração do app. Foque em campanhas de engajamento e programas de fidelidade.</p>
          </div>
          <div className="recommendation-card priority-low">
            <h4 className="priority-title low">Oportunidade de Crescimento</h4>
            <p><strong>Botafogo:</strong> Região com menor penetração oferece potencial de aquisição de novos usuários através de campanhas de marketing localizadas.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GeographicAnalysis;
