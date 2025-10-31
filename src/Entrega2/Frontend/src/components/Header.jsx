import React from 'react';
import { FaSearch, FaBell, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';
import DarkModeToggle from './DarkModeToggle'; // Supondo que você tenha isso
import { useProfile, PROFILES } from '../context/ProfileContext'; // 1. Importar o hook

const Header = ({ onToggleFilters }) => {
  const { currentProfile, setCurrentProfile } = useProfile(); // 2. Usar o hook

  const handleProfileChange = (e) => {
    setCurrentProfile(e.target.value);
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* ... (Logo ou Título) ... */}
      </div>

      <div className="header-right">
        {/* 3. Adicionar o Seletor de Perfil */}
        <div className="profile-selector">
          <FaUserCircle />
          <select value={currentProfile} onChange={handleProfileChange}>
            <option value={PROFILES.CEO}>Visão CEO</option>
            <option value={PROFILES.CFO}>Visão CFO</option>
          </select>
        </div>
        
        <DarkModeToggle />
        <button className="header-icon-btn" onClick={onToggleFilters}>
          Filtros
        </button>
        <button className="header-icon-btn">
          <FaBell />
        </button>
      </div>
    </header>
  );
};

export default Header;