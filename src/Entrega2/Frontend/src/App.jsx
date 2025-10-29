import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import FinancialAnalysis from './pages/FinancialAnalysis';
import CouponAnalysis from './pages/CouponAnalysis';
import ValidationScreen from './pages/ValidationScreen';
import GeographicAnalysis from './pages/GeographicAnalysis';
import UserAnalysis from './pages/UserAnalysis';
import StoreAnalysis from './pages/StoreAnalysis';
import { ProfileProvider } from './context/ProfileContext';
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

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 10000); // Limpa o erro após 10 segundos
  };

  const renderCurrentPage = () => {
    const pageProps = {
      filters,
      onError: handleError,
    };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} onFiltersChange={handleFiltersChange} />;
      case 'financial':
        return <FinancialAnalysis {...pageProps} />;
      case 'coupons':
        return <CouponAnalysis {...pageProps} />;
      case 'validation':
        return <ValidationScreen {...pageProps} />;
      case 'geographic':
        return <GeographicAnalysis {...pageProps} />;
      case 'users':
        return <UserAnalysis {...pageProps} />;
      case 'stores':
        return <StoreAnalysis {...pageProps} />;
      default:
        return <Dashboard {...pageProps} onFiltersChange={handleFiltersChange} />;
    }
  };

  const themeContextValue = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ProfileProvider>
        <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`} data-theme={darkMode ? 'dark' : 'light'}>
          {error && (
            <div className="error-banner">
              <AlertTriangle className="error-icon" size={20} />
              {error}
            </div>
          )}
          <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
            </aside>
            <main className="dashboard-main">
              <Header />
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      </ProfileProvider>
    </ThemeContext.Provider>
  );
};

export default App;
