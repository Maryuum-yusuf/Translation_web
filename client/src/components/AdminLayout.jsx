import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, logout, updateUser } from '../lib/api.js';

export default function AdminLayout({ title, subtitle, children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: auth?.fullName || '',
    phone: auth?.phone || ''
  });
  const [editLoading, setEditLoading] = useState(false);
  
  const initials = (auth?.fullName || auth?.phone || 'A')
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

  function toggleUserDropdown() {
    setShowUserDropdown(!showUserDropdown);
  }

  function handleEditUser() {
    setShowEditForm(true);
    setShowUserDropdown(false);
  }

  async function handleSaveUser() {
    try {
      setEditLoading(true);
      await updateUser(auth?.id, editFormData);
      // Refresh the page to update the auth data
      window.location.reload();
    } catch (error) {
      alert('Failed to update user info: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  }

  function handleCancelEdit() {
    setShowEditForm(false);
    setEditFormData({
      full_name: auth?.fullName || '',
      phone: auth?.phone || ''
    });
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
          
        </nav>

      </aside>
      <main className="admin-main">
                {/* Top Header with User Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          backgroundColor: '#1a73e8',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {(title || subtitle) && (
            <div>
              {title && <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', textTransform: 'uppercase' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{subtitle}</div>}
            </div>
          )}
          
          {/* User Info Section */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* User Info */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {auth?.fullName || 'Admin User'}
                <div style={{ 
                  display: 'inline-block',
                  padding: '2px 6px',
                  background: 'white',
                  color: '#000',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  Admin
                </div>
              </div>
            </div>
            
            {/* User Avatar - Clickable */}
            <button
              onClick={toggleUserDropdown}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '2px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {initials}
            </button>
            
            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  minWidth: '200px',
                  zIndex: 1000
                }}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                {/* User Details */}
                <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {auth?.fullName || 'Admin User'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {auth?.phone || 'No phone number'}
                  </div>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: '#1a73e8',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Admin
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={handleEditUser}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #1a73e8',
                      background: 'white',
                      color: '#1a73e8',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                  </button>
                </div>
                
                {/* Logout Button */}
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: '#1a73e8',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#1557b0'}
                    onMouseLeave={(e) => e.target.style.background = '#1a73e8'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
                {/* Main Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>

      {/* Edit User Modal */}
      {showEditForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={handleCancelEdit}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              Edit Profile
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Full Name
              </label>
              <input
                type="text"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Enter your full name"
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="Enter 9-digit number without +252"
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Enter 9-digit number without +252
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={editLoading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: '#1a73e8',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  opacity: editLoading ? 0.7 : 1
                }}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// (older alternate layout removed)


