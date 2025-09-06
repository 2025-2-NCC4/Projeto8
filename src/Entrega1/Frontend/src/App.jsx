import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import GeographicAnalysis from './pages/GeographicAnalysis';
import UserAnalysis from './pages/UserAnalysis';
import StoreAnalysis from './pages/StoreAnalysis';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [filters, setFilters] = useState(() => ({
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
  }));

  const [error, setError] = useState(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard filters={filters} onFiltersChange={handleFiltersChange} />;
      case 'geographic':
        return <GeographicAnalysis filters={filters} />;
      case 'users':
        return <UserAnalysis filters={filters} />;
      case 'stores':
        return <StoreAnalysis filters={filters} />;
      default:
        return <Dashboard filters={filters} onFiltersChange={handleFiltersChange} />;
    }
  };

  const themeContextValue = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`} data-theme={darkMode ? 'dark' : 'light'}>
        {error && (
          <div className="error-banner">
            <AlertTriangle className="error-icon" size={20} />
            {error}
          </div>
        )}

        <DarkModeToggle />
        
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <Navigation 
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </aside>
          
          <main className="dashboard-main">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
