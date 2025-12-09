import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.setItem('vega_admin_token', res.data.token);
      nav('/admin/dashboard');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h3>Admin Login</h3>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit}>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
