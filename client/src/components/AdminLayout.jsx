import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, logout } from '../lib/api.js';

export default function AdminLayout({ title, subtitle, children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const initials = (auth?.fullName || auth?.email || 'A')
    .split(' ')
    .map(s => s[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const roleLabel = (auth?.role || 'user').toLowerCase() === 'admin' ? 'Administrator' : 'User';

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="brand-row">
          <div className="brand-icon"><span className="brand-icon-text">A</span></div>
          <div className="brand-text">
            <div className="brand-title">Translation</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>
        <div className="brand-divider" />
        <nav className="side-links">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>
            Analytics
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 21 12h0a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </NavLink>
        </nav>
        <div className="side-footer">
          <div className="profile-block">
            <div className="profile-row">
              <div className="avatar" title={auth?.email || ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="who">
                <div className="name">{auth?.fullName || 'Admin User'}</div>
                <div className="email">
                  
                  {auth?.email || ''}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-pill">Logout</button>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        {(title || subtitle) && (
          <div className="admin-header">
            {title && <div className="admin-title">{title}</div>}
            {subtitle && <div className="admin-subtitle">{subtitle}</div>}
          </div>
        )}
          {children}
        </main>
    </div>
  );
}

// (older alternate layout removed)


