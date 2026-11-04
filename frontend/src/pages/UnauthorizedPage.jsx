import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { selectCurrentRole } from '../store/authSlice';
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';

export const UnauthorizedPage = () => {
  const currentRole = useSelector(selectCurrentRole);
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div className="container" style={{ maxWidth: '560px', marginTop: '3.5rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{
          background: '#fee2e2',
          color: '#ef4444',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <AlertTriangle size={32} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b' }}>Access Restricted</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your current account role is <span className={`badge badge-${currentRole || 'guest'}`}>{currentRole || 'Guest'}</span>.
          {requiredRoles.length > 0 && (
            <span> This portal requires: <strong>{requiredRoles.join(' or ')}</strong>.</span>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>
          <Link to="/login" className="btn btn-primary">
            <LogIn size={16} />
            Switch Role / Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
