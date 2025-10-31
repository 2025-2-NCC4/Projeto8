import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../App';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={`toggle-icon ${darkMode ? 'dark' : 'light'}`}>
        {darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
      </div>
    </button>
  );
};

export default DarkModeToggle;