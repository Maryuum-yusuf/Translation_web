import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAnalytics, isAdmin, exportAnalytics } from '../lib/api.js';
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

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    
    loadAnalytics();
  }, [navigate]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="section-title">Analytics & Reports</div>
          <div className="section-sub">Detailed insights and performance metrics</div>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          <span className="icon">⬇</span> Export Report
        </button>
      </div>

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
    </AdminLayout>
  );
}


