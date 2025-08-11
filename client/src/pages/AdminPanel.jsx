import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="page-card">
        <div className="page-header"><h2>Admin</h2></div>
        <div className="page-body">
          <p style={{ marginBottom: 12 }}>Please sign in to access the admin dashboard.</p>
          <Link to="/admin/login" className="translate-btn-main" style={{ display: 'inline-block', padding: '10px 16px' }}>Go to Login</Link>
        </div>
      </div>
    </div>
  );
}


