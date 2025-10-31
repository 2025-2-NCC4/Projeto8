import React from 'react';
import '../styles/ChartCard.css';

const ChartCard = ({ title, subtitle, isLoading, error, children, className = '' }) => {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      
      <div className="chart-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Carregando dados...</p>
          </div>
        )}
        
        {!isLoading && error && (
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && children}
      </div>
    </div>
  );
};

export default ChartCard;
