import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed } from '../lib/api.js';

export default function SettingsPage({ addToast }) {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem('darkMode') === 'true');
  const [textSize, setTextSize] = useState(parseInt(localStorage.getItem('textSize') || '16', 10));

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthed()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Apply persisted setting on first render only, without toast
  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark);
  }, []);

  function toggleDarkMode(next) {
    document.body.classList.toggle('dark-mode', next);
    localStorage.setItem('darkMode', String(next));
    setDark(next);
    addToast && addToast(next ? 'Dark mode enabled!' : 'Light mode enabled!', 'success');
  }

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${textSize}px`);
    localStorage.setItem('textSize', String(textSize));
  }, [textSize]);

  function reset() {
    if (!confirm('Reset all settings?')) return;
    setDark(false);
    setTextSize(16);
    addToast && addToast('Settings reset to default!', 'success');
  }

  return (
    <div className="page">
      <div className="page-card">
        <div className="page-header"><h2>Settings</h2></div>
        <div className="page-body">
          <div className="setting-group">
            <h3>Theme</h3>
            <div className="theme-toggle">
              <label className="switch">
                <input type="checkbox" checked={dark} onChange={(e) => toggleDarkMode(e.target.checked)} />
                <span className="slider round"></span>
              </label>
              <span className="setting-label">Dark Mode</span>
            </div>
          </div>
          <div className="setting-group">
            <h3>Text Size</h3>
            <div className="text-size-control">
              <label className="setting-label">Font Size: <span>{textSize}</span>px</label>
              <input type="range" min="12" max="46" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value, 10))} className="slider-range" />
              <div className="size-buttons">
                <button className="size-btn" onClick={() => setTextSize(12)}>Small</button>
                <button className="size-btn" onClick={() => setTextSize(16)}>Medium</button>
                <button className="size-btn" onClick={() => setTextSize(24)}>Large</button>
                <button className="size-btn" onClick={() => setTextSize(32)}>Extra Large</button>
              </div>
            </div>
          </div>
          {/* Reset removed per request */}
        </div>
      </div>
    </div>
  );
}


