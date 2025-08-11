import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from '../../lib/api.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      // ensure token persisted for subsequent requests
      localStorage.setItem('auth_token', data.token || '');
      localStorage.setItem('auth_role', data.role || '');
      localStorage.setItem('adminAuthed', 'true');
      if ((data.role || '').toLowerCase() !== 'admin') throw new Error('Admin account required');
      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div className="page-card">
        <div className="page-header"><h2>Admin Login</h2></div>
        <div className="page-body">
          {error && <div className="message error" style={{ position: 'static', marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <button disabled={loading} type="submit" className="translate-btn-main" style={{ width: '100%', marginTop: 12 }}>{loading ? 'Signing in...' : 'Sign in'}</button>
            </div>
          </form>
          <div style={{ marginTop: 12, fontSize: 13 }}>No admin account? <Link to="/admin/register">Create one</Link></div>
        </div>
      </div>
    </div>
  );
}


