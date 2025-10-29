import React, { useState, useEffect } from 'react';
import '../styles/FilterPanel.css';
import { getCurrentDate, getDateDaysAgo } from '../utils/dateUtils';

const FilterPanel = ({ filters, onFiltersChange, filterOptions, isLoading }) => {
  const [localFilters, setLocalFilters] = useState({
    startDate: getDateDaysAgo(30),
    endDate: getCurrentDate(),
    categoria: '',
    bairro: '',
    tipoCupom: '',
    ...filters
  });

  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    const updatedFilters = {
      ...localFilters,
      [filterName]: value
    };
    
    setLocalFilters(updatedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      startDate: getDateDaysAgo(30),
      endDate: getCurrentDate(),
      categoria: '',
      bairro: '',
      tipoCupom: ''
    };
    
    setLocalFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const applyQuickFilter = (days) => {
    const quickFilters = {
      ...localFilters,
      startDate: getDateDaysAgo(days),
      endDate: getCurrentDate()
    };
    
    setLocalFilters(quickFilters);
    if (onFiltersChange) {
      onFiltersChange(quickFilters);
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filtros</h3>
        <div className="filter-actions">
          <button
            className="btn-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Recolher filtros' : 'Expandir filtros'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          
          <div className="quick-filters">
            <label>Períodos rápidos:</label>
            <div className="quick-filter-buttons">
              <button 
                className="btn-quick-filter"
                onClick={() => applyQuickFilter(7)}
              >
                7 dias
              </button>
              <button 
                className="btn-quick-filter"
                onClick={() => applyQuickFilter(30)}
              >
                30 dias
              </button>
              <button 
                className="btn-quick-filter"
                onClick={() => applyQuickFilter(90)}
              >
                90 dias
              </button>
            </div>
          </div>

          <div className="filter-grid">
            
            <div className="filter-group">
              <label htmlFor="startDate">Data Início:</label>
              <input
                type="date"
                id="startDate"
                value={localFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                max={localFilters.endDate}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="endDate">Data Fim:</label>
              <input
                type="date"
                id="endDate"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={localFilters.startDate}
                max={getCurrentDate()}
              />
            </div>

            
            <div className="filter-group">
              <label htmlFor="categoria">Categoria:</label>
              <select
                id="categoria"
                value={localFilters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Todas as categorias</option>
                {filterOptions?.categorias?.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="filter-group">
              <label htmlFor="bairro">Bairro:</label>
              <select
                id="bairro"
                value={localFilters.bairro}
                onChange={(e) => handleFilterChange('bairro', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Todos os bairros</option>
                {filterOptions?.bairros?.map((bairro) => (
                  <option key={bairro} value={bairro}>
                    {bairro}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="filter-group">
              <label htmlFor="tipoCupom">Tipo de Cupom:</label>
              <select
                id="tipoCupom"
                value={localFilters.tipoCupom}
                onChange={(e) => handleFilterChange('tipoCupom', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Todos os tipos</option>
                {filterOptions?.tiposCupom?.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="filter-group">
              <button
                className="btn-clear-filters"
                onClick={clearFilters}
                disabled={isLoading}
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          
          <div className="active-filters">
            {Object.entries(localFilters).some(([key, value]) => 
              value && key !== 'startDate' && key !== 'endDate'
            ) && (
              <div className="active-filters-list">
                <span>Filtros ativos:</span>
                {localFilters.categoria && (
                  <span className="filter-tag">
                    Categoria: {localFilters.categoria}
                    <button onClick={() => handleFilterChange('categoria', '')}>×</button>
                  </span>
                )}
                {localFilters.bairro && (
                  <span className="filter-tag">
                    Bairro: {localFilters.bairro}
                    <button onClick={() => handleFilterChange('bairro', '')}>×</button>
                  </span>
                )}
                {localFilters.tipoCupom && (
                  <span className="filter-tag">
                    Cupom: {localFilters.tipoCupom}
                    <button onClick={() => handleFilterChange('tipoCupom', '')}>×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
