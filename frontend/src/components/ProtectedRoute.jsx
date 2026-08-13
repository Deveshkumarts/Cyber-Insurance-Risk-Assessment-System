import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { OrganizationContext } from '../context/OrganizationContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(OrganizationContext);
  const location = useLocation();

  // If there's a loading state in your context you might want to wait for it, 
  // but since we rely on localStorage primarily, we can just check user directly.
  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
