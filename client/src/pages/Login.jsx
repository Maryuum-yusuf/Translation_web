import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, isAuthed } from '../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthed()) {
      navigate('/'); // Redirect to home page if already logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      setLoginSuccess(true);
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, don't show the form
  if (isAuthed()) {
    return (
      <div className="page">
        <div className="page-card">
          <div className="page-header">
            <h2>Already Logged In</h2>
          </div>
          <div className="page-body">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', color: '#10b981', marginBottom: '16px' }}>
                ✓ You are already logged in!
              </div>
              <p>Redirecting to translation page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loginSuccess) {
    return (
      <div className="page">
        <div className="page-card">
          <div className="page-header">
            <h2>Login Successful</h2>
          </div>
          <div className="page-body">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', color: '#10b981', marginBottom: '16px' }}>
                ✓ Login successful!
              </div>
              <p>Redirecting to translation page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-card">
        <div className="page-header">
          <h2>Login</h2>
        </div>
        <div className="page-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="auth-links">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
