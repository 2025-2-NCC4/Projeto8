import React from 'react';
import { Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '../src/App';
import '../styles/Header.css';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <BarChart3 size={32} className="logo-icon" />
          <h1 className="header-title">PicMoney Dashboard</h1>
        </div>
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="theme-toggle-text">
              {darkMode ? 'Light' : 'Dark'} Mode
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;