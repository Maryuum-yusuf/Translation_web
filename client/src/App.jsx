import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Translator from './components/Translator.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

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

  const handleNavClick = useCallback((section) => {
    if (section === 'home') navigate('/');
    if (section === 'admin') navigate('/admin');
  }, [navigate]);

  const activeTab = (function() {
    if (location.pathname.startsWith('/history')) return 'history';
    if (location.pathname.startsWith('/favorites')) return 'favorites';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'home';
  })();

  return (
    <div className="app">
      <Nav onNavigate={handleNavClick} active={activeTab} />
      <Routes>
        <Route path="/" element={<Translator addToast={addToast} />} />
        <Route path="/history" element={<HistoryPage addToast={addToast} />} />
        <Route path="/favorites" element={<FavoritesPage addToast={addToast} />} />
        <Route path="/settings" element={<SettingsPage addToast={addToast} />} />
        <Route path="/admin" element={<AdminPanel />} />
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


