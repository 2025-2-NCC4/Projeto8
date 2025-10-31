import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import '../styles/MetricsCard.css';

const MetricsCard = ({ title, value, change, changeType, icon, trend }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return '#10b981';
    if (changeType === 'negative') return '#ef4444';
    return '#64748b';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp size={16} />;
    if (changeType === 'negative') return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  return (
    <div className="metrics-card">
      <div className="metrics-header">
        <div className="metrics-icon">{icon}</div>
        <div className="metrics-trend">
          {trend && trend.map((point, idx) => (
            <div 
              key={idx} 
              className="trend-bar" 
              style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="metrics-content">
        <h3 className="metrics-title">{title}</h3>
        <div className="metrics-value">{value}</div>
        
        {change && (
          <div className="metrics-change" style={{ color: getChangeColor() }}>
            <span className="change-icon">{getChangeIcon()}</span>
            <span className="change-value">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;