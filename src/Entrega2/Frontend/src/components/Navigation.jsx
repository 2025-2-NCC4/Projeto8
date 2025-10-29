import React from 'react';
import { BarChart3, Map, Users, Store, DollarSign, Tag, CheckSquare } from 'lucide-react';
import '../App.css';
import { useProfile, PROFILES } from '../context/ProfileContext';

const Navigation = ({ currentPage, onPageChange }) => {
  // 1. Define a lista completa de todas as páginas possíveis.
  const allPages = [
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

  const { currentProfile } = useProfile(); // 2. Obtém o perfil atual do contexto.

  // 3. Define quais páginas cada perfil pode ver.
  const ceoPageIds = ['dashboard', 'users', 'coupons', 'geographic', 'stores'];
  const cfoPageIds = ['dashboard', 'financial', 'coupons', 'validation'];

  // 4. Filtra a lista completa de páginas com base no perfil ativo.
  const navItems = currentProfile === PROFILES.CEO
    ? allPages.filter(page => ceoPageIds.includes(page.id))
    : allPages.filter(page => cfoPageIds.includes(page.id));

  return (
    <nav className="dashboard-navigation">
      <div className="nav-header">
        <h2>PIC Money</h2>
        <p>C-Level Dashboard</p>
      </div>
      <div className="nav-menu">
        {navItems.map(page => (
          <button key={page.id} className={`nav-item ${currentPage === page.id ? 'active' : ''}`} onClick={() => onPageChange(page.id)}>
            <div className="nav-icon">{page.icon}</div>
            <div className="nav-content">
              <span className="nav-title">{page.name}</span>
              <span className="nav-description">{page.description}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
export default Navigation;