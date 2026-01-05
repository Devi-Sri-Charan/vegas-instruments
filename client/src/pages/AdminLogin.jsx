import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    
    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.setItem('vega_admin_token', res.data.token);
      nav('/admin/dashboard');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 col-lg-4">
        <div className="admin-section">
          <div className="text-center mb-4">
            <div style={{ 
              width: 60, 
              height: 60, 
              background: 'var(--accent-green)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--bg-dark)'
            }}>
              V
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Admin Login</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Enter your credentials to access the dashboard
            </p>
          </div>

          {err && (
            <div className="alert alert-danger" role="alert">
              {err}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                className="form-control" 
                placeholder="admin@vegas.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter your password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <button 
              className="btn btn-primary w-100" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}