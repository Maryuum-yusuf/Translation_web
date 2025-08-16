import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAnalytics, isAdmin, exportAnalytics, getTranslationsReport, exportTranslationsReport, getReportsSummary } from '../lib/api.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reports state
  const [activeTab, setActiveTab] = useState('analytics');
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [filterParams, setFilterParams] = useState({
    start_date: '',
    end_date: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    page: 1,
    limit: 50
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    
    loadAnalytics();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, filterParams]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data: ' + err.message);
      console.error('Analytics data error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      setReportsLoading(true);
      setReportsError('');
      const data = await getTranslationsReport(filterParams);
      setReportsData(data);
    } catch (err) {
      setReportsError('Failed to load reports data: ' + err.message);
      console.error('Reports data error:', err);
    } finally {
      setReportsLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      // Use backend endpoint for export
      const response = await exportAnalytics();
      
      // Create and download file
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export analytics: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReportsExport = async () => {
    try {
      const response = await exportTranslationsReport(filterParams);
      
      // Create and download file
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `translations_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export reports: ' + (error.message || 'Unknown error'));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilterParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleFilterSubmit = () => {
    loadReports();
  };

  const handlePageChange = (newPage) => {
    setFilterParams(prev => ({ ...prev, page: newPage }));
  };

  // Chart configurations
  const usagePatternsChartData = {
    labels: analyticsData?.usage_patterns?.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Translations',
        data: analyticsData?.usage_patterns?.map(day => day.count) || [],
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1a73e8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const userRetentionChartData = {
    labels: analyticsData?.user_retention?.map(week => {
      const date = new Date(week.week);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Active Users',
        data: analyticsData?.user_retention?.map(week => week.active_users) || [],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const featureUsageChartData = {
    labels: ['Favorites', 'History', 'Voice Input'],
    datasets: [
      {
        data: [
          analyticsData?.popular_features?.favorites_used || 0,
          analyticsData?.popular_features?.history_accessed || 0,
          analyticsData?.popular_features?.voice_input_used || 0,
        ],
        backgroundColor: [
          '#1a73e8',
          '#10b981',
          '#f59e0b',
        ],
        borderColor: [
          '#1a73e8',
          '#10b981',
          '#f59e0b',
        ],
        borderWidth: 2,
        cutout: '60%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1a73e8',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1a73e8',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics & Reports" subtitle="Detailed insights and performance metrics">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading analytics data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics & Reports" subtitle="Detailed insights and performance metrics">
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
    <AdminLayout title="Analytics & Reports" subtitle="Detailed insights and performance metrics">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'analytics' ? '#1a73e8' : 'transparent',
            color: activeTab === 'analytics' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'reports' ? '#1a73e8' : 'transparent',
            color: activeTab === 'reports' ? 'white' : '#6b7280',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Reports
        </button>
      </div>

      {activeTab === 'analytics' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="section-title">Analytics</div>
              <div className="section-sub">Detailed insights and performance metrics</div>
            </div>
            <button className="btn btn-primary" onClick={handleExport}>
              <span className="icon">⬇</span> Export Analytics
            </button>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="section-title">Translation Reports</div>
              <div className="section-sub">Detailed translation reports with filtering</div>
            </div>
            <button className="btn btn-primary" onClick={handleReportsExport}>
              <span className="icon">⬇</span> Export Reports
            </button>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Summary Cards */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-card-head">
                <div className="title">Translation Volume</div>
                <div className="spark">📈</div>
              </div>
              <div className="list">
                <div className="row">
                  <span>Today</span>
                  <strong>{analyticsData?.translation_volume?.today || 0}</strong>
                </div>
                <div className="row">
                  <span>This Week</span>
                  <strong>{analyticsData?.translation_volume?.this_week || 0}</strong>
                </div>
                <div className="row">
                  <span>This Month</span>
                  <strong>{analyticsData?.translation_volume?.this_month || 0}</strong>
                </div>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-head">
                <div className="title">User Engagement</div>
                <div className="spark">👥</div>
              </div>
              <div className="list">
                <div className="row">
                  <span>Daily Active Users</span>
                  <strong>{analyticsData?.user_engagement?.daily_active_users || 0}</strong>
                </div>
                <div className="row">
                  <span>Weekly Active Users</span>
                  <strong>{analyticsData?.user_engagement?.weekly_active_users || 0}</strong>
                </div>
                <div className="row">
                  <span>Monthly Active Users</span>
                  <strong>{analyticsData?.user_engagement?.monthly_active_users || 0}</strong>
                </div>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-head">
                <div className="title">Popular Features</div>
                <div className="spark">⭐</div>
              </div>
              <div className="list">
                <div className="row">
                  <span>Favorites Used</span>
                  <strong>{analyticsData?.popular_features?.favorites_used || 0}</strong>
                </div>
                <div className="row">
                  <span>History Accessed</span>
                  <strong>{analyticsData?.popular_features?.history_accessed || 0}</strong>
                </div>
                <div className="row">
                  <span>Voice Input Used</span>
                  <strong>{analyticsData?.popular_features?.voice_input_used || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="analysis-panels">
            <div className="panel">
              <div className="panel-head">Usage Patterns (Last 7 Days)</div>
              <div className="panel-body">
                <div style={{ height: '300px', padding: '16px' }}>
                  {analyticsData?.usage_patterns?.length > 0 ? (
                    <Line data={usagePatternsChartData} options={chartOptions} />
                  ) : (
                    <div className="placeholder-chart">No usage data available</div>
                  )}
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">User Retention (Last 4 Weeks)</div>
              <div className="panel-body">
                <div style={{ height: '300px', padding: '16px' }}>
                  {analyticsData?.user_retention?.length > 0 ? (
                    <Bar data={userRetentionChartData} options={chartOptions} />
                  ) : (
                    <div className="placeholder-chart">No retention data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Usage Chart */}
          <div className="panel" style={{ marginTop: '16px' }}>
            <div className="panel-head">Feature Usage Distribution</div>
            <div className="panel-body">
              <div style={{ height: '300px', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                {analyticsData?.popular_features ? (
                  <div style={{ width: '300px', height: '300px' }}>
                    <Doughnut data={featureUsageChartData} options={doughnutOptions} />
                  </div>
                ) : (
                  <div className="placeholder-chart">No feature usage data available</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <>
          {/* Reports Filter Section */}
          <div className="panel" style={{ marginBottom: '16px' }}>
            <div className="panel-head">Filter Reports</div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filterParams.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filterParams.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Year
                  </label>
                  <select
                    value={filterParams.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    {Array.from({ length: 6 }, (_, i) => 2025 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Month
                  </label>
                  <select
                    value={filterParams.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Results per Page
                  </label>
                  <select
                    value={filterParams.limit}
                    onChange={(e) => handleFilterChange('limit', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button
                    onClick={handleFilterSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Error */}
          {reportsError && (
            <div style={{ 
              background: '#ffeaea', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px' 
            }}>
              {reportsError}
            </div>
          )}

          {/* Reports Loading */}
          {reportsLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Loading reports data...</div>
            </div>
          )}

          {/* Reports Data */}
          {!reportsLoading && reportsData && (
            <>
              {/* Statistics Summary */}
              <div className="analytics-grid" style={{ marginBottom: '16px' }}>
                <div className="analytics-card">
                  <div className="analytics-card-head">
                    <div className="title">Total Translations</div>
                    <div className="spark">📊</div>
                  </div>
                  <div className="list">
                    <div className="row">
                      <span>In Period</span>
                      <strong>{reportsData.statistics?.total_translations || 0}</strong>
                    </div>
                    <div className="row">
                      <span>Unique Users</span>
                      <strong>{reportsData.statistics?.unique_users || 0}</strong>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-head">
                    <div className="title">Pagination</div>
                    <div className="spark">📄</div>
                  </div>
                  <div className="list">
                    <div className="row">
                      <span>Page</span>
                      <strong>{reportsData.page || 1}</strong>
                    </div>
                    <div className="row">
                      <span>Total Pages</span>
                      <strong>{reportsData.pages || 1}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Translations Table */}
              <div className="panel">
                <div className="panel-head">Translation Details</div>
                <div className="panel-body">
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1a73e8', color: 'white' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>User</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Timestamp</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Original Text</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Translated Text</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Languages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData.translations?.length > 0 ? (
                          reportsData.translations.map((translation, index) => (
                            <tr key={translation._id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '600' }}>{translation.user_name || 'Guest User'}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{translation.user_email}</div>
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px' }}>
                                {new Date(translation.timestamp).toLocaleString()}
                              </td>
                              <td style={{ padding: '12px', maxWidth: '200px' }}>
                                <div style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  fontSize: '14px'
                                }}>
                                  {translation.original_text || 'N/A'}
                                </div>
                              </td>
                              <td style={{ padding: '12px', maxWidth: '200px' }}>
                                <div style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  fontSize: '14px'
                                }}>
                                  {translation.translated_text || 'N/A'}
                                </div>
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px' }}>
                                {translation.source_language} → {translation.target_language}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                              No translations found for the selected period
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {reportsData.pages > 1 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginTop: '16px' 
                    }}>
                      <button
                        onClick={() => handlePageChange(reportsData.page - 1)}
                        disabled={reportsData.page <= 1}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          background: reportsData.page <= 1 ? '#f3f4f6' : 'white',
                          color: reportsData.page <= 1 ? '#9ca3af' : '#374151',
                          borderRadius: '6px',
                          cursor: reportsData.page <= 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Previous
                      </button>
                      <span style={{ padding: '8px 12px', color: '#374151' }}>
                        Page {reportsData.page} of {reportsData.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(reportsData.page + 1)}
                        disabled={reportsData.page >= reportsData.pages}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          background: reportsData.page >= reportsData.pages ? '#f3f4f6' : 'white',
                          color: reportsData.page >= reportsData.pages ? '#9ca3af' : '#374151',
                          borderRadius: '6px',
                          cursor: reportsData.page >= reportsData.pages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}


