import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import { OrganizationContext } from '../context/OrganizationContext';

const Navbar = () => {
  const location = useLocation();
  const { organization, user, login, logout } = useContext(OrganizationContext);
  const [organizations, setOrganizations] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/organizations')
      .then(res => res.json())
      .then(data => setOrganizations(data))
      .catch(err => console.error('Failed to load organizations', err));
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'text-cyber-neon border-b-2 border-cyber-neon' : 'text-cyber-muted hover:text-cyber-text transition-colors';
  };

  return (
    <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-cyber-neon" />
              <span className="font-bold text-xl tracking-wider">CIRAS</span>
            </Link>
          </div>
          <div className="flex space-x-6 items-center">
            <Link to="/" className={`px-3 py-2 text-sm font-medium ${isActive('/')}`}>Home</Link>
            
            {user && (
              <>
                <Link to="/knowledge-base" className={`px-3 py-2 text-sm font-medium ${isActive('/knowledge-base')}`}>Knowledge Base</Link>
                <Link to="/assessment" className={`px-3 py-2 text-sm font-medium ${isActive('/assessment')}`}>Assess Risk</Link>
                <Link to="/asset-assessment" className={`px-3 py-2 text-sm font-medium ${isActive('/asset-assessment')}`}>Insurance</Link>
                <Link to="/incidents" className={`px-3 py-2 text-sm font-medium ${isActive('/incidents')}`}>Incidents</Link>
                <Link to="/claims" className={`px-3 py-2 text-sm font-medium ${isActive('/claims')}`}>Claims</Link>
                <Link to="/analytics" className={`px-3 py-2 text-sm font-medium ${isActive('/analytics')}`}>Analytics</Link>
              </>
            )}
            
            
            {/* Organization Login */}
            <div className="relative ml-4 pl-4 border-l border-gray-700">
              {organization ? (
                <div className="flex items-center gap-4">
                  <Link to="/my-dashboard" className="text-sm font-bold text-cyber-neon hover:text-white transition-colors">
                    My Dashboard
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 text-sm font-bold text-cyber-accent hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
                    >
                      {organization.organization_name}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-cyber-dark border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                          <p className="text-xs text-cyber-neon font-bold mt-1">{user?.role}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }} 
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="flex items-center text-sm font-bold text-cyber-dark hover:text-cyber-dark bg-cyber-neon px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
