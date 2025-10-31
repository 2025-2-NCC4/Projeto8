import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './Header.css';
import DarkModeToggle from './DarkModeToggle';
import { useProfile, PROFILES } from '../context/ProfileContext';

const Header = () => {
  const { currentProfile, setCurrentProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const profiles = [
    { value: PROFILES.CEO, label: 'Visão CEO' },
    { value: PROFILES.CFO, label: 'Visão CFO' }
  ];

  const currentProfileLabel = profiles.find(p => p.value === currentProfile)?.label || 'Visão CEO';

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

        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Header;