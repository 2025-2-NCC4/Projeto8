import React from 'react';
import { BarChart3, Map, Users, Store } from 'lucide-react';
import './Navigation.css';

const Navigation = ({ currentPage, onPageChange }) => {
  const pages = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <BarChart3 size={20} />,
      description: 'Visão Geral Estratégica'
    },
    {
      id: 'geographic',
      name: 'Análise Geográfica',
      icon: <Map size={20} />,
      description: 'Heatmap e Oportunidades'
    },
    {
      id: 'users',
      name: 'Análise de Usuários',
      icon: <Users size={20} />,
      description: 'Comportamento Temporal'
    },
    {
      id: 'stores',
      name: 'Análise de Lojas',
      icon: <Store size={20} />,
      description: 'Performance Detalhada'
    }
  ];

  return (
    <nav className="dashboard-navigation">
      <div className="nav-header">
        <h2>PicMoney</h2>
        <p>C-Level Dashboard</p>
      </div>
      
      <div className="nav-menu">
        {pages.map(page => (
          <button
            key={page.id}
            className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
            onClick={() => onPageChange(page.id)}
          >
            <div className="nav-icon">
              {page.icon}
            </div>
            <div className="nav-content">
              <span className="nav-title">{page.name}</span>
              <span className="nav-description">{page.description}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
