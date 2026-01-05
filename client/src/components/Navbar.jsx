import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const adminToken = !!localStorage.getItem('vega_admin_token');
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'var(--accent-green)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            fontWeight: 700,
            color: 'var(--bg-dark)'
          }}>
            V
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Vegas Instruments</div>
            <small style={{ fontSize: '0.75rem', color: 'var(--text-grey)' }}>
              Precision. Performance. Professional.
            </small>
          </div>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Products</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/login">Admin</Link>
            </li>
            {adminToken && (
              <li className="nav-item">
                <Link className="btn btn-outline-primary ms-2" to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}