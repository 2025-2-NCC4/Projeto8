import React from 'react';
import { BarChart3, Map, Users, Store, DollarSign, Tag, CheckSquare } from 'lucide-react';
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
      id: 'financial',
      name: 'Análise Financeira',
      icon: <DollarSign size={20} />,
      description: 'Margem e Receita Líquida'
    },
    {
      id: 'coupons',
      name: 'Análise de Cupons',
      icon: <Tag size={20} />,
      description: 'Performance por Tipo'
    },
    {
      id: 'validation',
      name: 'Central de Validação',
      icon: <CheckSquare size={20} />,
      description: 'Validação e Repasses'
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
        <h2>PIC Money</h2>
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
