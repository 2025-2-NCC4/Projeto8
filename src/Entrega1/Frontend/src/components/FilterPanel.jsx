import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { FiFilter, FiCalendar, FiMapPin, FiTag, FiUsers, FiDollarSign, FiX } from 'react-icons/fi';
import { dashboardAPI } from '../services/api';

const FilterPanel = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [filterOptions, setFilterOptions] = useState({
    categorias: [],
    bairros: [],
    tiposCupom: []
  });
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {

    const active = [];
    if (filters.startDate || filters.endDate) active.push('Date Range');
    if (filters.categoria) active.push(`Category: ${filters.categoria}`);
    if (filters.bairro) active.push(`Location: ${filters.bairro}`);
    if (filters.tipoCupom) active.push(`Coupon: ${filters.tipoCupom}`);
    if (filters.ageRange) active.push(`Age: ${filters.ageRange}`);
    if (filters.gender) active.push(`Gender: ${filters.gender}`);
    if (filters.minValue || filters.maxValue) active.push('Value Range');
    
    setActiveFilters(active);
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const options = await dashboardAPI.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      border: state.isFocused ? '2px solid #667eea' : '1px solid #e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #667eea' : 'none',
      '&:hover': {
        border: '1px solid #667eea'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#667eea' 
        : state.isFocused 
          ? '#f1f5f9' 
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#667eea' : '#f8fafc'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#5b21b6'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#5b21b6',
      '&:hover': {
        backgroundColor: '#c4b5fd',
        color: '#4c1d95'
      }
    })
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      categoria: '',
      bairro: '',
      tipoCupom: '',
      ageRange: '',
      gender: '',
      deviceType: '',
      minValue: '',
      maxValue: ''
    });
  };

  const clearFilter = (filterType) => {
    switch(filterType) {
      case 'Date Range':
        handleFilterChange('startDate', '');
        handleFilterChange('endDate', '');
        break;
      case 'Category':
        handleFilterChange('categoria', '');
        break;
      case 'Location':
        handleFilterChange('bairro', '');
        break;
      case 'Coupon':
        handleFilterChange('tipoCupom', '');
        break;
      case 'Age':
        handleFilterChange('ageRange', '');
        break;
      case 'Gender':
        handleFilterChange('gender', '');
        break;
      case 'Value Range':
        handleFilterChange('minValue', '');
        handleFilterChange('maxValue', '');
        break;
    }
  };

  const categoryOptions = filterOptions.categorias?.map(cat => ({
    value: cat,
    label: cat
  })) || [];

  const locationOptions = filterOptions.bairros?.map(bairro => ({
    value: bairro,
    label: bairro
  })) || [];

  const couponOptions = filterOptions.tiposCupom?.map(tipo => ({
    value: tipo,
    label: tipo
  })) || [];

  const ageOptions = [
    { value: '18-24', label: '18-24 years' },
    { value: '25-34', label: '25-34 years' },
    { value: '35-44', label: '35-44 years' },
    { value: '45-54', label: '45-54 years' },
    { value: '55+', label: '55+ years' }
  ];

  const genderOptions = [
    { value: 'Masculino', label: 'Male' },
    { value: 'Feminino', label: 'Female' },
    { value: 'Outro', label: 'Other' }
  ];

  return (
    <>
      {}
      <motion.button
        className="filter-toggle-btn"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiFilter size={20} />
        <span>Filters</span>
        {activeFilters.length > 0 && (
          <motion.div 
            className="filter-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {activeFilters.length}
          </motion.div>
        )}
      </motion.button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="filter-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          >
            <motion.div
              className="filter-panel"
              initial={{ x: 350 }}
              animate={{ x: 0 }}
              exit={{ x: 350 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="filter-header">
                <div className="filter-title">
                  <FiFilter size={24} />
                  <h3>Advanced Filters</h3>
                </div>
                <button className="filter-close" onClick={onToggle}>
                  <FiX size={24} />
                </button>
              </div>

              <div className="filter-content">
                {}
                {activeFilters.length > 0 && (
                  <div className="active-filters-section">
                    <div className="section-header">
                      <span>Active Filters ({activeFilters.length})</span>
                      <button 
                        className="clear-all-btn"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="active-filters">
                      {activeFilters.map((filter, index) => (
                        <motion.div
                          key={filter}
                          className="active-filter-tag"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <span>{filter}</span>
                          <button onClick={() => clearFilter(filter.split(':')[0])}>
                            <FiX size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiCalendar size={18} />
                    <span>Date Range</span>
                  </div>
                  <div className="date-range-inputs">
                    <div className="input-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="filter-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="filter-input"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiTag size={18} />
                    <span>Category</span>
                  </div>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find(opt => opt.value === filters.categoria)}
                    onChange={(selected) => handleFilterChange('categoria', selected?.value || '')}
                    placeholder="Select category..."
                    isClearable
                    styles={customSelectStyles}
                    className="filter-select"
                  />
                </div>

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiMapPin size={18} />
                    <span>Location</span>
                  </div>
                  <Select
                    options={locationOptions}
                    value={locationOptions.find(opt => opt.value === filters.bairro)}
                    onChange={(selected) => handleFilterChange('bairro', selected?.value || '')}
                    placeholder="Select location..."
                    isClearable
                    styles={customSelectStyles}
                    className="filter-select"
                  />
                </div>

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiTag size={18} />
                    <span>Coupon Type</span>
                  </div>
                  <Select
                    options={couponOptions}
                    value={couponOptions.find(opt => opt.value === filters.tipoCupom)}
                    onChange={(selected) => handleFilterChange('tipoCupom', selected?.value || '')}
                    placeholder="Select coupon type..."
                    isClearable
                    styles={customSelectStyles}
                    className="filter-select"
                  />
                </div>

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiUsers size={18} />
                    <span>Demographics</span>
                  </div>
                  <div className="demographics-filters">
                    <div className="input-group">
                      <label>Age Range</label>
                      <Select
                        options={ageOptions}
                        value={ageOptions.find(opt => opt.value === filters.ageRange)}
                        onChange={(selected) => handleFilterChange('ageRange', selected?.value || '')}
                        placeholder="Select age range..."
                        isClearable
                        styles={customSelectStyles}
                        className="filter-select"
                      />
                    </div>
                    <div className="input-group">
                      <label>Gender</label>
                      <Select
                        options={genderOptions}
                        value={genderOptions.find(opt => opt.value === filters.gender)}
                        onChange={(selected) => handleFilterChange('gender', selected?.value || '')}
                        placeholder="Select gender..."
                        isClearable
                        styles={customSelectStyles}
                        className="filter-select"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="filter-section">
                  <div className="filter-section-title">
                    <FiDollarSign size={18} />
                    <span>Value Range</span>
                  </div>
                  <div className="value-range-inputs">
                    <div className="input-group">
                      <label>Min Value (R$)</label>
                      <input
                        type="number"
                        value={filters.minValue}
                        onChange={(e) => handleFilterChange('minValue', e.target.value)}
                        placeholder="0.00"
                        className="filter-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="input-group">
                      <label>Max Value (R$)</label>
                      <input
                        type="number"
                        value={filters.maxValue}
                        onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                        placeholder="1000.00"
                        className="filter-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterPanel;