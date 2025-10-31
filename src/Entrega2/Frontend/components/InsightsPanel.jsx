import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Target, RotateCcw, MapPin, Users, Clock, Lightbulb } from 'lucide-react';
import '../styles/InsightsPanel.css';
import { formatCurrency, formatNumber } from '../utils/dateUtils';

const InsightsPanel = ({ data }) => {
  const insights = [
    {
      type: 'revenue',
      title: 'Crescimento da Receita',
      description: 'Crescimento de 23% em relação ao mês anterior',
      value: '+23%',
      trend: 'positive',
      icon: <TrendingUp size={24} />,
      color: 'accent'
    },
    {
      type: 'conversion',
      title: 'Taxa de Conversão',
      description: 'Usuários com app PicMoney convertem 3.2x mais',
      value: '67.8%',
      trend: 'positive',
      icon: <Target size={24} />,
      color: 'primary'
    },
    {
      type: 'retention',
      title: 'Retenção de Usuários',
      description: 'Clientes que usam cupons de produto retornam mais',
      value: '85%',
      trend: 'positive',
      icon: <RotateCcw size={24} />,
      color: 'secondary'
    },
    {
      type: 'geographic',
      title: 'Concentração Geográfica',
      description: 'Pinheiros e Vila Madalena lideram em volume',
      value: '42%',
      trend: 'neutral',
      icon: <MapPin size={24} />,
      color: 'primary'
    },
    {
      type: 'demographics',
      title: 'Perfil Demográfico',
      description: 'Faixa 25-40 anos representa 60% das transações',
      value: '60%',
      trend: 'positive',
      icon: <Users size={24} />,
      color: 'accent'
    },
    {
      type: 'behavioral',
      title: 'Padrão de Uso',
      description: 'Picos de atividade: 12h-14h e 18h-20h',
      value: '2x',
      trend: 'positive',
      icon: <Clock size={24} />,
      color: 'secondary'
    }
  ];

  const getInsightCardClass = (color) => {
    return `insight-card insight-card-${color}`;
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'positive': return <TrendingUp size={16} />;
      case 'negative': return <TrendingDown size={16} />;
      default: return <ArrowRight size={16} />;
    }
  };

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <h2 className="insights-title">
          <Lightbulb size={28} className="insights-icon" />
          Insights Estratégicos
        </h2>
        <p className="insights-subtitle">
          Análises automáticas baseadas nos dados dos últimos 30 dias
        </p>
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={insight.type} className={getInsightCardClass(insight.color)}>
            <div className="insight-header">
              <div className="insight-icon-container">
                <span className="insight-emoji">{insight.icon}</span>
              </div>
              <div className="insight-trend">
                <span className={`trend-indicator trend-${insight.trend}`}>
                  {getTrendIcon(insight.trend)}
                </span>
              </div>
            </div>
            
            <div className="insight-content">
              <div className="insight-value">{insight.value}</div>
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-description">{insight.description}</p>
            </div>

          </div>
        ))}
      </div>

      <div className="insights-summary">
        <div className="summary-card">
          <h3 className="summary-title">Resumo Executivo</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">ROI do PicMoney:</span>
              <span className="summary-value positive">+156%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Valor médio por usuário:</span>
              <span className="summary-value">{formatCurrency(342.50)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Taxa de recompra:</span>
              <span className="summary-value positive">+18%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Categorias em crescimento:</span>
              <span className="summary-value">Saúde, Alimentação</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;