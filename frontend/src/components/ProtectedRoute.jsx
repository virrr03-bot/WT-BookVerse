import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, selectCurrentRole } from '../store/authSlice';

/**
 * ProtectedRoute: Guards routes against unauthenticated access
 * and verifies role-based authorizations.
 *
 * @param {Array<string>} allowedRoles - List of authorized roles (e.g., ['customer', 'fresh_seller'])
 * @param {React.ReactNode} children - Optional nested component to render
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentRole = useSelector(selectCurrentRole);
  const user = useSelector(selectCurrentUser);

  // 1. If not authenticated, redirect to login while preserving target path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If route specifies role restrictions, verify the user's role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" state={{ requiredRoles: allowedRoles, currentRole }} replace />;
  }

  // 3. User is authorized, render children or Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
