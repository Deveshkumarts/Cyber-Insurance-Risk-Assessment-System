import React, { createContext, useState, useEffect } from 'react';

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);

  // Load from localStorage on initialization
  useEffect(() => {
    const storedOrg = localStorage.getItem('currentOrganization');
    const storedUser = localStorage.getItem('currentUser');
    if (storedOrg) {
      try {
        setOrganization(JSON.parse(storedOrg));
      } catch (e) {
        console.error('Failed to parse stored organization');
      }
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user');
      }
    }
  }, []);

  const login = (orgData, userData = null) => {
    setOrganization(orgData);
    localStorage.setItem('currentOrganization', JSON.stringify(orgData));
    if (userData) {
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setOrganization(null);
    setUser(null);
    localStorage.removeItem('currentOrganization');
    localStorage.removeItem('currentUser');
  };

  return (
    <OrganizationContext.Provider value={{ organization, user, login, logout }}>
      {children}
    </OrganizationContext.Provider>
  );
};
