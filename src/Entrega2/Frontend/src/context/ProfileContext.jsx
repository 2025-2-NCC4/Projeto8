import React, { createContext, useState, useContext } from 'react';

export const PROFILES = {
  CEO: 'ceo',
  CFO: 'cfo',
};

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState(PROFILES.CEO);

  return (
    <ProfileContext.Provider value={{ currentProfile, setCurrentProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);