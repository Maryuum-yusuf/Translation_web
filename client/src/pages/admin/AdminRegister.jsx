import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login } from '../../lib/api.js';

export default function AdminRegister() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, role });
      const data = await login({ email, password });
      localStorage.setItem('auth_token', data.token || '');
      localStorage.setItem('auth_role', data.role || '');
      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      setError(e.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <div className="page-card">
        <div className="page-header"><h2>Create Admin Account</h2></div>
        <div className="page-body">
          {error && <div className="message error" style={{ position: 'static', marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label>Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Maryam Yusuf" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <label>Account type</label>
              <select value={role} onChange={(e)=>setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <button disabled={loading} type="submit" className="translate-btn-main" style={{ width: '100%', marginTop: 12 }}>{loading ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
          <div style={{ marginTop: 12, fontSize: 13 }}>Already have an account? <Link to="/admin/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}


