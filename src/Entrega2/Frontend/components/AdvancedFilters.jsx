import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, RotateCcw, Check, Smartphone, Tablet, Monitor } from 'lucide-react';
import '../styles/AdvancedFilters.css';

const AdvancedFilters = ({ filters, onFiltersChange, filterOptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: '2025-07-01',
      endDate: '2025-08-01',
      categoria: '',
      bairro: '',
      tipoCupom: '',
      ageRange: '',
      gender: '',
      deviceType: '',
      minValue: '',
      maxValue: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const quickDateFilters = [
    { label: 'Período Completo', startDate: '2025-07-01', endDate: '2025-08-01' },
    { label: 'Primeira Semana', startDate: '2025-07-01', endDate: '2025-07-07' },
    { label: 'Segunda Semana', startDate: '2025-07-08', endDate: '2025-07-14' },
    { label: 'Terceira Semana', startDate: '2025-07-15', endDate: '2025-07-21' },
    { label: 'Quarta Semana', startDate: '2025-07-22', endDate: '2025-07-28' },
    { label: 'Última Semana', startDate: '2025-07-29', endDate: '2025-08-01' }
  ];

  const setQuickDate = (dateRange) => {
    const updatedFilters = {
      ...localFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          <Search size={20} className="filters-icon" />
          Filtros Avançados
        </h3>
        <button 
          className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="quick-filters">
        <div className="quick-dates">
          {quickDateFilters.map((dateRange) => (
            <button
              key={dateRange.label}
              className="quick-date-btn"
              onClick={() => setQuickDate(dateRange)}
            >
              {dateRange.label}
            </button>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="filters-expanded">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Período</label>
              <div className="date-range">
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="filter-input"
                  min="2025-07-01"
                  max="2025-08-01"
                />
                <span className="date-separator">até</span>
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="filter-input"
                  min="2025-07-01"
                  max="2025-08-01"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Categoria</label>
              <select
                value={localFilters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as categorias</option>
                {filterOptions.categorias?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Bairro</label>
              <select
                value={localFilters.bairro}
                onChange={(e) => handleFilterChange('bairro', e.target.value)}
                className="filter-select"
              >
                <option value="">Todos os bairros</option>
                {filterOptions.bairros?.map(bairro => (
                  <option key={bairro} value={bairro}>{bairro}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tipo de Cupom</label>
              <div className="checkbox-group">
                {filterOptions.tiposCupom?.map(tipo => (
                  <label key={tipo} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={localFilters.tipoCupom?.split(',').filter(t => t).includes(tipo) || false}
                      onChange={(e) => {
                        const current = localFilters.tipoCupom || '';
                        const types = current.split(',').filter(t => t.trim());
                        if (e.target.checked) {
                          if (!types.includes(tipo)) {
                            types.push(tipo);
                          }
                        } else {
                          const index = types.indexOf(tipo);
                          if (index > -1) types.splice(index, 1);
                        }
                        handleFilterChange('tipoCupom', types.join(','));
                      }}
                    />
                    <span className="checkbox-text">{tipo}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Faixa Etária</label>
              <select
                value={localFilters.ageRange}
                onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as idades</option>
                <option value="18-25">18-25 anos</option>
                <option value="26-35">26-35 anos</option>
                <option value="36-45">36-45 anos</option>
                <option value="46-60">46-60 anos</option>
                <option value="60+">60+ anos</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Gênero</label>
              <div className="radio-group">
                {['Todos', 'Masculino', 'Feminino', 'Outro'].map(gender => (
                  <label key={gender} className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value={gender === 'Todos' ? '' : gender}
                      checked={localFilters.gender === (gender === 'Todos' ? '' : gender)}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                    />
                    <span className="radio-text">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Valor da Transação</label>
              <div className="value-range">
                <input
                  type="number"
                  placeholder="Min (R$)"
                  value={localFilters.minValue}
                  onChange={(e) => handleFilterChange('minValue', e.target.value)}
                  className="filter-input"
                />
                <span className="value-separator">-</span>
                <input
                  type="number"
                  placeholder="Max (R$)"
                  value={localFilters.maxValue}
                  onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Dispositivo</label>
              <div className="device-buttons">
                {[
                  { name: 'Todos', icon: <Monitor size={16} /> },
                  { name: 'iPhone', icon: <Smartphone size={16} /> },
                  { name: 'Android', icon: <Tablet size={16} /> }
                ].map(({ name, icon }) => (
                  <button
                    key={name}
                    className={`device-btn ${localFilters.deviceType === (name === 'Todos' ? '' : name) ? 'active' : ''}`}
                    onClick={() => handleFilterChange('deviceType', name === 'Todos' ? '' : name)}
                  >
                    {icon} {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button className="filter-btn reset-btn" onClick={handleReset}>
              <RotateCcw size={16} className="btn-icon" />
              Limpar
            </button>
            <button className="filter-btn apply-btn" onClick={handleApply}>
              <Check size={16} className="btn-icon" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;