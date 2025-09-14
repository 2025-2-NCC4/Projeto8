import React from 'react';
import { X, Filter } from 'lucide-react';
import '../styles/FilterIndicator.css';

const FilterIndicator = ({ filters, onClearFilter, onClearAll }) => {
  const getActiveFilters = () => {
    const active = [];
    
    if (filters.startDate && filters.endDate) {
      active.push({
        key: 'dateRange',
        label: `Período: ${filters.startDate} - ${filters.endDate}`,
        value: `${filters.startDate}_${filters.endDate}`
      });
    }
    
    if (filters.categoria) {
      active.push({
        key: 'categoria',
        label: `Categoria: ${filters.categoria}`,
        value: filters.categoria
      });
    }
    
    if (filters.bairro) {
      active.push({
        key: 'bairro',
        label: `Bairro: ${filters.bairro}`,
        value: filters.bairro
      });
    }
    
    if (filters.tipoCupom) {
      const types = filters.tipoCupom.split(',').filter(t => t.trim());
      if (types.length > 0) {
        active.push({
          key: 'tipoCupom',
          label: `Cupons: ${types.join(', ')}`,
          value: filters.tipoCupom
        });
      }
    }
    
    if (filters.ageRange) {
      active.push({
        key: 'ageRange',
        label: `Idade: ${filters.ageRange}`,
        value: filters.ageRange
      });
    }
    
    if (filters.gender) {
      active.push({
        key: 'gender',
        label: `Gênero: ${filters.gender}`,
        value: filters.gender
      });
    }
    
    if (filters.deviceType) {
      active.push({
        key: 'deviceType',
        label: `Dispositivo: ${filters.deviceType}`,
        value: filters.deviceType
      });
    }
    
    if (filters.minValue || filters.maxValue) {
      const min = filters.minValue ? `R$ ${filters.minValue}` : '';
      const max = filters.maxValue ? `R$ ${filters.maxValue}` : '';
      const range = min && max ? `${min} - ${max}` : min || max;
      active.push({
        key: 'valueRange',
        label: `Valor: ${range}`,
        value: `${filters.minValue || ''}_${filters.maxValue || ''}`
      });
    }
    
    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="filter-indicator">
      <div className="filter-indicator-header">
        <div className="filter-indicator-title">
          <Filter size={16} />
          <span>Filtros Ativos ({activeFilters.length})</span>
        </div>
        {activeFilters.length > 1 && (
          <button 
            className="clear-all-btn"
            onClick={onClearAll}
            title="Limpar todos os filtros"
          >
            Limpar Todos
          </button>
        )}
      </div>
      
      <div className="filter-tags">
        {activeFilters.map((filter) => (
          <div key={filter.key} className="filter-tag">
            <span className="filter-tag-label">{filter.label}</span>
            <button 
              className="filter-tag-remove"
              onClick={() => onClearFilter(filter.key)}
              title={`Remover filtro: ${filter.label}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterIndicator;