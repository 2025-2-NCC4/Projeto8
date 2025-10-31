import React from 'react';
import '../styles/HeatmapChart.css';
import { formatCurrency } from '../utils/dateUtils';

const HeatmapChart = ({ data, title = "Heatmap de Atividade por Hora e Dia" }) => {
  const generateHeatmapData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmapData = days.map((day, dayIndex) => 
      hours.map(hour => ({
        day,
        hour,
        dayIndex,
        intensity: Math.random() * 100,
        transactions: Math.floor(Math.random() * 50) + 1,
        revenue: Math.random() * 10000 + 1000
      }))
    ).flat();

    return heatmapData;
  };

  let heatmapData = [];
  
  if (data && data.length > 0) {
    const activityMap = {};
    
    data.forEach(item => {
      try {
        const date = new Date(item.data || item.date);
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        
        const key = `${dayOfWeek}-${hour}`;
        if (!activityMap[key]) {
          activityMap[key] = {
            transactions: 0,
            revenue: 0
          };
        }
        
        activityMap[key].transactions += 1;
        activityMap[key].revenue += parseFloat(item.valor || item.valor_total || 0);
      } catch (e) {
      }
    });
    
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    heatmapData = days.map((day, dayIndex) => 
      hours.map(hour => {
        const key = `${dayIndex}-${hour}`;
        const activity = activityMap[key] || { transactions: 0, revenue: 0 };
        
        return {
          day,
          hour,
          dayIndex,
          intensity: activity.transactions,
          transactions: activity.transactions,
          revenue: activity.revenue
        };
      })
    ).flat();
  } else {
    heatmapData = generateHeatmapData();
  }
  
  const maxIntensity = Math.max(...heatmapData.map(d => d.intensity), 1);

  const getColorIntensity = (intensity) => {
    const normalizedIntensity = intensity / maxIntensity;
    const opacity = Math.max(0.1, normalizedIntensity);
    return `rgba(99, 102, 241, ${opacity})`;
  };

  const CustomTooltip = ({ data }) => (
    <div className="heatmap-tooltip">
      <div className="tooltip-header">
        <strong>{data.day} - {data.hour}:00</strong>
      </div>
      <div className="tooltip-content">
        <p>Transações: {data.transactions}</p>
        <p>Receita: {formatCurrency(data.revenue)}</p>
        <p>Intensidade: {data.intensity.toFixed(1)}%</p>
      </div>
    </div>
  );

  return (
    <div className="heatmap-container">
      <h3 className="heatmap-title">{title}</h3>
      
      <div className="heatmap-chart">
        <div className="heatmap-days-label">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="day-label">{day}</div>
          ))}
        </div>
        
        <div className="heatmap-grid">
          {heatmapData.map((cell, index) => (
            <div
              key={`${cell.day}-${cell.hour}`}
              className="heatmap-cell"
              style={{
                backgroundColor: getColorIntensity(cell.intensity),
                gridColumn: cell.hour + 1,
                gridRow: cell.dayIndex + 1
              }}
              title={`${cell.day} ${cell.hour}:00 - ${cell.transactions} transações - ${formatCurrency(cell.revenue)}`}
            />
          ))}
        </div>
        
        <div className="heatmap-hours-label">
          {Array.from({ length: 24 }, (_, i) => i).filter(h => h % 4 === 0).map(hour => (
            <div key={hour} className="hour-label" style={{ gridColumn: hour + 1 }}>
              {hour}h
            </div>
          ))}
        </div>
      </div>
      
      <div className="heatmap-legend">
        <span className="legend-label">Menos ativo</span>
        <div className="legend-gradient" />
        <span className="legend-label">Mais ativo</span>
      </div>
    </div>
  );
};

export default HeatmapChart;