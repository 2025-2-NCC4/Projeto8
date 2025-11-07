import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiTrendingUp, 
  FiUsers, 
  FiSmartphone,
  FiBarChart,
  FiTarget,
  FiCalendar,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { dashboardAPI } from '../services/api';
import './UserAnalysis.css';

const PeakHoursHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="heatmap-placeholder">Carregando mapa de calor...</div>;
  }

  const diasPt = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const diasEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const allValues = data.flatMap(day => day.horarios?.map(h => h.cupons) || []);
  const maxValue = Math.max(...allValues, 1);

  let peakHour = 0, peakDay = 'Monday', peakValue = 0;
  data.forEach(dayData => {
    dayData.horarios?.forEach(hourData => {
      if (hourData.cupons > peakValue) {
        peakValue = hourData.cupons;
        peakHour = hourData.hora;
        peakDay = dayData.dia;
      }
    });
  });

  return (
    <div className="peak-hours-heatmap">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <FiClock size={24} />
          <h3>Horários de Pico de Atividade</h3>
        </div>
        <p>Volume de cupons capturados por dia da semana e hora.</p>
      </div>
      <div className="heatmap-container">
        <div className="heatmap-grid">
          <div className="heatmap-hour-header">
            <div className="day-label"></div>
            {Array.from({length: 24}, (_, i) => (
              <div key={i} className="hour-label">{i}H</div>
            ))}
          </div>
          {diasEn.map((dayEn, dayIndex) => {
            const dayData = data.find(d => d.dia === dayEn);
            return (
              <div key={dayEn} className="heatmap-row">
                <div className="day-label">{diasPt[dayIndex]}</div>
                {Array.from({length: 24}, (_, hour) => {
                  const hourData = dayData?.horarios?.find(h => h.hora === hour);
                  const value = hourData?.cupons || 0;
                  const intensity = value / maxValue;
                  return (
                    <div
                      key={hour}
                      className="heatmap-cell"
                      style={{ 
                        backgroundColor: `rgba(76, 175, 80, ${intensity})`,
                        color: intensity > 0.6 ? 'white' : 'var(--text-primary-color)'
                      }}
                      title={`${diasPt[dayIndex]} - ${hour}:00 | Cupons: ${value}`}
                    >
                      {value > 0 ? value : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="heatmap-legend">
        <div className="legend-title">Intensidade</div>
        <div className="legend-gradient">
          <span>Baixa</span>
          <div className="gradient-bar"></div>
          <span>Alta</span>
        </div>
      </div>
    </div>
  );
};

const TimeAnalysisMetrics = ({ peakData }) => {
  if (!peakData || peakData.length === 0) return null;

  const allHourlyData = peakData.flatMap(day => day.horarios || []);
  const totalCupons = allHourlyData.reduce((sum, h) => sum + (h.cupons || 0), 0);
  
  const bestHour = allHourlyData.reduce((best, current) => (current.cupons || 0) > (best.cupons || 0) ? current : best, { hora: 0, cupons: 0 });
  const worstHour = allHourlyData.reduce((worst, current) => (current.cupons || Infinity) < (worst.cupons || Infinity) ? current : worst, { hora: 0, cupons: Infinity });

  const bestDay = peakData.reduce((best, current) => {
    const dayTotal = (current.horarios || []).reduce((sum, h) => sum + (h.cupons || 0), 0);
    const bestTotal = (best.horarios || []).reduce((sum, h) => sum + (h.cupons || 0), 0);
    return dayTotal > bestTotal ? current : best;
  }, { dia: 'Monday', horarios: [] });

  const diasPt = { 'Monday': 'Segunda', 'Tuesday': 'Terça', 'Wednesday': 'Quarta', 'Thursday': 'Quinta', 'Friday': 'Sexta', 'Saturday': 'Sábado', 'Sunday': 'Domingo' };

  return (
    <div className="time-analysis-metrics">
      <div className="metrics-header">
        <FiBarChart size={24} />
        <h3>Métricas de Atividade</h3>
      </div>
      <div className="metrics-cards">
        <div className="metric-card">
          <div className="metric-icon"><FiClock size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Horário de Pico Geral</div>
            <div className="metric-value">{bestHour.hora}:00h</div>
            <div className="metric-detail">{bestHour.cupons} cupons</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiTrendingUp size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Dia Mais Ativo</div>
            <div className="metric-value">{diasPt[bestDay.dia]}</div>
            <div className="metric-detail">{ (bestDay.horarios || []).reduce((sum, h) => sum + (h.cupons || 0), 0)} cupons</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiUsers size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Total de Cupons</div>
            <div className="metric-value">{totalCupons.toLocaleString('pt-BR')}</div>
            <div className="metric-detail">Período analisado</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><FiAlertCircle size={20} /></div>
          <div className="metric-content">
            <div className="metric-label">Menor Atividade</div>
            <div className="metric-value">{worstHour.hora}:00h</div>
            <div className="metric-detail">{worstHour.cupons} cupons</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemographicCharts = ({ customerSegments = [] }) => {
  const genderData = Object.entries(customerSegments.reduce((acc, c) => {
    const gender = c.gender === 'M' ? 'Masculino' : c.gender === 'F' ? 'Feminino' : 'Outro';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const ageData = Object.entries(customerSegments.reduce((acc, c) => {
    const age = c.age || 0;
    if (age < 25) acc['18-24'] = (acc['18-24'] || 0) + 1;
    else if (age < 35) acc['25-34'] = (acc['25-34'] || 0) + 1;
    else if (age < 45) acc['35-44'] = (acc['35-44'] || 0) + 1;
    else if (age < 55) acc['45-54'] = (acc['45-54'] || 0) + 1;
    else acc['55+'] = (acc['55+'] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const GENDER_COLORS = { 'Masculino': '#0D47A1', 'Feminino': '#FFC107', 'Outro': '#4CAF50' };
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="demographic-charts">
      <div className="chart-title">
        <FiUsers size={24} />
        <h3>Perfil Demográfico dos Usuários</h3>
      </div>
      <div className="demographic-content">
        <div className="demo-chart">
          <h4>Distribuição por Gênero</h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={renderCustomizedLabel}>
                {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value.toLocaleString('pt-BR'), name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="demo-chart">
          <h4>Distribuição por Faixa Etária</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [value.toLocaleString('pt-BR'), 'Usuários']} />
              <Bar dataKey="value" name="Usuários" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const UserAnalysis = ({ filters }) => {
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {

        const mockPeakHours = [
          { dia: 'Monday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 50 + 10) })) },
          { dia: 'Tuesday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 50 + 10) })) },
          { dia: 'Wednesday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 50 + 10) })) },
          { dia: 'Thursday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 50 + 10) })) },
          { dia: 'Friday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 60 + 15) })) },
          { dia: 'Saturday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 70 + 20) })) },
          { dia: 'Sunday', horarios: Array.from({length: 24}, (_, i) => ({ hora: i, cupons: Math.floor(Math.random() * 40 + 5) })) }
        ];
        
        const mockSegments = Array.from({length: 200}, (_, i) => ({
          gender: ['M', 'F', 'O'][Math.floor(Math.random() * 3)],
          age: Math.floor(Math.random() * 60) + 18
        }));
        
        setPeakHoursData(mockPeakHours);
        setCustomerSegments(mockSegments);
      } catch (err) {
        console.error('Erro ao carregar análise de usuários:', err);
        setError('Não foi possível carregar os dados dos usuários.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading) return <div className="loading">Carregando análise de usuários...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <motion.div 
      className="user-analysis-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div className="page-title">
          <FiUsers size={32} />
          <h1>Análise de Comportamento do Usuário</h1>
        </div>
        <p>Explore os padrões de uso, horários de pico e o perfil demográfico dos seus clientes.</p>
      </div>

      <div className="user-analytics-layout">
        <div className="peak-hours-section">
          <PeakHoursHeatmap data={peakHoursData} />
        </div>
        
        <div className="metrics-and-demographics">
          <TimeAnalysisMetrics peakData={peakHoursData} />
          <DemographicCharts customerSegments={customerSegments} />
        </div>
      </div>

      <div className="engagement-metrics-section">
        <div className="section-header">
          <FiActivity size={24} />
          <h3>Indicadores de Engajamento - Julho 2025</h3>
        </div>
        <p className="section-description">
          Análise completa do comportamento e engajamento dos usuários no período de 01/07/2025 a 31/07/2025
        </p>

        <div className="engagement-metrics-grid">
          <div className="engagement-card primary">
            <div className="engagement-icon">
              <FiUsers size={28} />
            </div>
            <div className="engagement-content">
              <h4>DAU - Daily Active Users</h4>
              <div className="engagement-value">2.158,03</div>
              <div className="engagement-unit">usuários/dia</div>
              <div className="engagement-detail">
                <span>Pico: 2.203 (05/jul)</span>
                <span>Mínimo: 2.102 (08/jul)</span>
              </div>
            </div>
          </div>

          <div className="engagement-card primary">
            <div className="engagement-icon">
              <FiCalendar size={28} />
            </div>
            <div className="engagement-content">
              <h4>WAU - Weekly Active Users</h4>
              <div className="engagement-value">4.385,20</div>
              <div className="engagement-unit">usuários/semana</div>
              <div className="engagement-detail">
                <span>Melhor semana: 4.514 usuários</span>
              </div>
            </div>
          </div>

          <div className="engagement-card primary">
            <div className="engagement-icon">
              <FiTrendingUp size={28} />
            </div>
            <div className="engagement-content">
              <h4>MAU - Monthly Active Users</h4>
              <div className="engagement-value">4.813</div>
              <div className="engagement-unit">usuários únicos</div>
              <div className="engagement-detail">
                <span>Total no período analisado</span>
              </div>
            </div>
          </div>

          <div className="engagement-card success">
            <div className="engagement-icon">
              <FiTarget size={28} />
            </div>
            <div className="engagement-content">
              <h4>Taxa de Retenção</h4>
              <div className="engagement-value">84,71%</div>
              <div className="engagement-unit">retenção após 30 dias</div>
              <div className="engagement-detail">
                <span>3.823 de 4.513 usuários retornaram</span>
              </div>
            </div>
          </div>

          <div className="engagement-card success">
            <div className="engagement-icon">
              <FiAlertCircle size={28} />
            </div>
            <div className="engagement-content">
              <h4>Taxa de Churn</h4>
              <div className="engagement-value">1,27%</div>
              <div className="engagement-unit">usuários inativos ≥14 dias</div>
              <div className="engagement-detail">
                <span>Apenas 61 usuários inativos</span>
                <span>94,89% ativos recentemente</span>
              </div>
            </div>
          </div>

          <div className="engagement-card info">
            <div className="engagement-icon">
              <FiClock size={28} />
            </div>
            <div className="engagement-content">
              <h4>Tempo Médio de Sessão</h4>
              <div className="engagement-value">24,48</div>
              <div className="engagement-unit">minutos por sessão</div>
              <div className="engagement-detail">
                <span>82.001 sessões identificadas</span>
                <span>83,26% com até 15 minutos</span>
              </div>
            </div>
          </div>

          <div className="engagement-card info">
            <div className="engagement-icon">
              <FiBarChart size={28} />
            </div>
            <div className="engagement-content">
              <h4>Sessões por Usuário</h4>
              <div className="engagement-value">17,04</div>
              <div className="engagement-unit">sessões/usuário</div>
              <div className="engagement-detail">
                <span>Média no período de 31 dias</span>
                <span>Top usuário: 54 sessões</span>
              </div>
            </div>
          </div>
        </div>

        <div className="engagement-summary">
          <div className="summary-header">
            <FiTrendingUp size={20} />
            <h4>Resumo Executivo</h4>
          </div>
          <div className="summary-cards">
            <div className="summary-item positive">
              <strong>Engajamento Excelente</strong>
              <p>Alta taxa de retenção (84,71%) indica que os usuários voltam frequentemente ao app</p>
            </div>
            <div className="summary-item positive">
              <strong>Baixo Churn</strong>
              <p>Apenas 1,27% de churn demonstra satisfação e valor percebido pelos usuários</p>
            </div>
            <div className="summary-item neutral">
              <strong>Sessões Frequentes</strong>
              <p>Média de 17 sessões/usuário por mês mostra uso regular e consistente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="behavioral-insights">
        <div className="insights-header">
          <FiTarget size={24} />
          <h3>Recomendações Estratégicas</h3>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-title"><FiSmartphone size={16} /><h4>Timing para Notificações Push</h4></div>
            <p>Maximize a taxa de abertura enviando notificações nos horários de pico identificados no mapa de calor. Evite os horários de menor atividade.</p>
          </div>
          <div className="insight-card">
            <div className="insight-title"><FiCalendar size={16} /><h4>Promoções Semanais</h4></div>
            <p>Lance suas melhores ofertas e cupons nos dias da semana com maior volume de transações para impulsionar ainda mais o engajamento e a receita.</p>
          </div>
          <div className="insight-card">
            <div className="insight-title"><FiActivity size={16} /><h4>Alocação de Suporte</h4></div>
            <p>Dimensione sua equipe de suporte ao cliente para estar mais disponível durante os horários de pico, garantindo uma melhor experiência do usuário.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserAnalysis;
