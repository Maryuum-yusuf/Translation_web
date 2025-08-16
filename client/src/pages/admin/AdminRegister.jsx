import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login } from '../../lib/api.js';

export default function AdminRegister() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ full_name: fullName, phone, password, role });
      const data = await login({ phone, password });
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
              <label style={{ display: 'flex', alignItems: 'center', color: '#1a73e8' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Full name
              </label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="full name" style={{ padding: 10, borderRadius: 8, border: '1px solid #1a73e8' }} />
              <label style={{ display: 'flex', alignItems: 'center', color: '#1a73e8' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Phone Number
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter 9-digit number without +252" style={{ padding: 10, borderRadius: 8, border: '1px solid #1a73e8' }} />
              <div style={{ fontSize: '12px', color: '#666' }}>
                Enter 9-digit number without +252
                <span style={{ float: 'right', color: '#1a73e8' }}>{phone.length}/9</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', color: '#1a73e8' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #1a73e8', width: '100%', paddingRight: '40px' }} 
                />
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#1a73e8" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', color: '#1a73e8' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                Account type
              </label>
              <select value={role} onChange={(e)=>setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #1a73e8' }}>
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


