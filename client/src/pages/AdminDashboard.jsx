import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { getDashboardStats, isAdmin } from '../lib/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    
    loadDashboardData();
  }, [navigate]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch {
      return '';
    }
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Manage your translation app">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading dashboard data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Manage your translation app">
        <div style={{ 
          background: '#ffeaea', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Manage your translation app">
        <div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-row">
                <div className="stat-title">Total Users</div>
                <div className="stat-icon icon-blue">👤</div>
              </div>
              <div className="stat-value">{dashboardData?.total_users || 0}</div>
              <div className="stat-trend">
                {dashboardData?.suspended_users || 0} <span className="muted">suspended</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-row">
                <div className="stat-title">Translations Today</div>
                <div className="stat-icon icon-green">〰</div>
              </div>
              <div className="stat-value">{dashboardData?.translations_today || 0}</div>
              <div className="stat-trend">
                {dashboardData?.translations_month || 0} <span className="muted">this month</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-row">
                <div className="stat-title">Active Today</div>
                <div className="stat-icon icon-purple">🕒</div>
              </div>
              <div className="stat-value">{dashboardData?.active_users_today || 0}</div>
              <div className="stat-trend">
                {dashboardData?.total_users || 0} <span className="muted">total users</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-row">
                <div className="stat-title">Total Favorites</div>
                <div className="stat-icon icon-gold">⭐</div>
              </div>
              <div className="stat-value">{dashboardData?.total_favorites || 0}</div>
              <div className="stat-trend">
                <span className="muted">all time</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div className="setting-group">
              <h3>Top Users This Month</h3>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {dashboardData?.top_users_month?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dashboardData.top_users_month.map((user, index) => (
                      <div key={user.user_id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        background: '#f8fafc',
                        borderRadius: '6px'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            {index + 1}. {user.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {user.email}
                          </div>
                        </div>
                        <div style={{ 
                          background: '#1a73e8', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.translation_count} translations
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    height: 220, 
                    background: '#f1f5f9', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    No data available
                  </div>
                )}
              </div>
            </div>
            <div className="setting-group">
              <h3>Top Users This Week</h3>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {dashboardData?.top_users_week?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dashboardData.top_users_week.map((user, index) => (
                      <div key={user.user_id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        background: '#f8fafc',
                        borderRadius: '6px'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            {index + 1}. {user.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {user.email}
                          </div>
                        </div>
                        <div style={{ 
                          background: '#10b981', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.translation_count} translations
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    height: 220, 
                    background: '#f1f5f9', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="setting-group" style={{ marginTop: 16 }}>
            <h3>Recent Activity</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {dashboardData?.recent_activity?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dashboardData.recent_activity.map((activity, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: '#1a73e8', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {activity.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
                            {activity.user_name || 'Unknown User'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {formatTime(activity.timestamp)}
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          <strong>Translated:</strong> {truncateText(activity.original_text || '')}
                        </div>
                        <div style={{ fontSize: '13px', color: '#059669' }}>
                          <strong>To:</strong> {truncateText(activity.translated_text || '')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {activity.source_language} → {activity.target_language}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  height: 200, 
                  background: '#f1f5f9', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '24px' }}>📝</div>
                  <div>No recent activity</div>
                  <div style={{ fontSize: '12px' }}>Translations will appear here</div>
                </div>
              )}
            </div>
          </div>


        </div>
    </AdminLayout>
  );
}


