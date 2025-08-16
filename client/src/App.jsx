import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Translator from './components/Translator.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminAnalytics from './pages/AdminAnalytics.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminRegister from './pages/admin/AdminRegister.jsx';
import AdminDebug from './pages/AdminDebug.jsx';
// AdminRegister page was removed; keep login only
import HistoryPage from './pages/HistoryPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import VoiceRecordingsPage from './pages/VoiceRecordingsPage.jsx';
import VoiceHistoryPage from './pages/VoiceHistoryPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function App() {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Global dark mode + text size from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    const textSize = parseInt(localStorage.getItem('textSize') || '16', 10);
    document.documentElement.style.setProperty('--app-font-size', `${textSize}px`);
  }, []);

  // Removed handleNavClick as Nav component now handles navigation directly

  const activeTab = (function() {
    if (location.pathname.startsWith('/history')) return 'history';
    if (location.pathname.startsWith('/favorites')) return 'favorites';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/voice-recordings')) return 'voice-recordings';
    if (location.pathname.startsWith('/voice-history')) return 'voice-history';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'home';
  })();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminRoute && <Nav active={activeTab} />}
      <Routes>
        <Route path="/" element={<Translator addToast={addToast} />} />
        <Route path="/history" element={<HistoryPage addToast={addToast} />} />
        <Route path="/favorites" element={<FavoritesPage addToast={addToast} />} />
        <Route path="/settings" element={<SettingsPage addToast={addToast} />} />
        <Route path="/voice-recordings" element={<VoiceRecordingsPage addToast={addToast} />} />
        <Route path="/voice-history" element={<VoiceHistoryPage addToast={addToast} />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/debug" element={<AdminDebug />} />
      </Routes>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`message ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}

export default App;


