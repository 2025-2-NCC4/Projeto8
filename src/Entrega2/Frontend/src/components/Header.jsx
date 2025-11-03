import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Header.css'; // O seu CSS existente
import DarkModeToggle from './DarkModeToggle';
import { useProfile, PROFILES } from '../context/ProfileContext';
import AlertsPanel from './AlertsPanel'; // Você já tinha este import

// Você já tinha este ícone
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

const Header = () => {
  // Seus hooks e estados existentes
  const { currentProfile, setCurrentProfile } = useProfile();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false); 
  const [isOpen, setIsOpen] = useState(false); 
  const dropdownRef = useRef(null); 

  const profiles = [
    { value: PROFILES.CEO, label: 'CEO' },
    { value: PROFILES.CFO, label: 'CFO' },
  ];

  const currentProfileLabel = profiles.find(
    (p) => p.value === currentProfile
  )?.label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSelect = (profileValue) => {
    setCurrentProfile(profileValue);
    setIsOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">Dashboard</h1>
        </div>

        <div className="header-right">
          
          <div className="profile-selector" ref={dropdownRef}>
            <FaUserCircle className="profile-icon" />
            <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
              <span className="selected-value">{currentProfileLabel}</span>
              <FaChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
            </div>

            {isOpen && (
              <div className="dropdown-menu">
                {profiles.map((profile) => (
                  <div
                    key={profile.value}
                    className={`dropdown-item ${currentProfile === profile.value ? 'active' : ''}`}
                    onClick={() => handleProfileSelect(profile.value)}
                  >
                    {profile.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            className="alerts-button"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            aria-label="Mostrar notificações e alertas"
          >
            <BellIcon />
        
          </button>
          
          <DarkModeToggle />
        </div>
      </header>
      
 
      <AlertsPanel isOpen={isAlertsOpen} />


      {isAlertsOpen && (
        <div
          className="alerts-panel-click-off"
          onClick={() => setIsAlertsOpen(false)}
        />
      )}
    </>
  );
};

export default Header;