import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAdminUsers, suspendUser, unsuspendUser, isAdmin, register, updateUser } from '../lib/api.js';

// Add User Modal Component
function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      setFormData({ full_name: '', email: '', password: '', role: 'user' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New User</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateUser(user._id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit User</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit_full_name">Full Name *</label>
            <input
              type="text"
              id="edit_full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit_email">Email *</label>
            <input
              type="email"
              id="edit_email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit_role">Role *</label>
            <select
              id="edit_role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q));
  }, [users, search]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminUsers(currentPage, 10);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    load();
  }, [navigate, currentPage]);

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    try {
      // This function is no longer used with the new API, but kept for now
      // await deleteUser(id); 
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  }

  async function handleToggleSuspend(u) {
    try {
      if (u.is_suspended) {
        await unsuspendUser(u._id);
      } else {
        await suspendUser(u._id);
      }
      // Reload the current page to get updated data
      load();
    } catch (e) {
      alert(e.message || 'Failed to update user status');
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = () => {
    load(); // Reload users after successful operation
  };

  const handleExport = async () => {
    try {
      // Export directly from frontend data (no API call needed)
      const csvContent = [
        // CSV header
        ['Name', 'Email', 'Role', 'Created At', 'Status'].join(','),
        // CSV data rows
        ...users.map(user => [
          `"${(user.full_name || '').replace(/"/g, '""')}"`,
          `"${(user.email || '').replace(/"/g, '""')}"`,
          `"${(user.role || '').replace(/"/g, '""')}"`,
          `"${user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}"`,
          `"${user.is_suspended ? 'Suspended' : 'Active'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export users: ' + (error.message || 'Unknown error'));
    }
  };

  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeSlashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  );
  const EditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );

  return (
    <AdminLayout title="User Management" subtitle="Manage all registered users">
      <div className="toolbar-row">
        <div className="toolbar-actions">
          <button className="btn btn-outline" onClick={handleExport}>
            <span className="icon">⬇</span> Export
          </button>
          <button className="btn btn-primary" onClick={handleAddUser}>
            <span className="icon">＋</span> Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 16 }}>Loading…</div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const joined = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
                const role = u.role || '-';
                return (
                  <tr key={u._id || idx}>
                    <td style={{ fontWeight: 600 }}>{u.full_name || '-'}</td>
                    <td>{u.email}</td>
                    <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{role}</td>
                    <td>{joined}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-icons">
                        {role === 'admin' ? (
                          <button className="action-chip gray" title="Admin users cannot be suspended" disabled>
                            <EyeIcon />
                          </button>
                        ) : (
                          <button 
                            className={`action-chip ${u.is_suspended ? 'red' : 'green'}`} 
                            title={u.is_suspended ? 'Unsuspend User' : 'Suspend User'} 
                            onClick={() => handleToggleSuspend(u)}
                          >
                            {u.is_suspended ? <EyeSlashIcon /> : <EyeIcon />}
                          </button>
                        )}
                        <button 
                          className="action-chip green" 
                          title="Edit"
                          onClick={() => handleEditUser(u)}
                        >
                          <EditIcon />
                        </button>
                        <button className="action-chip red" title="Delete" onClick={() => handleDelete(u._id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (<div className="empty">No users found.</div>)}
          <div className="pagination-row">
            <button 
              className="btn btn-outline small" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button 
                  key={pageNum}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              className="btn btn-outline small" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {error && <div style={{ color: '#dc2626', marginTop: 12, fontWeight: 700 }}>{error}</div>}

      {/* Modals */}
      <AddUserModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <EditUserModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={handleModalSuccess}
        user={selectedUser}
      />
    </AdminLayout>
  );
}


