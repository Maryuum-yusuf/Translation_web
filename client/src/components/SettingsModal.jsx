import React, { useEffect, useState } from 'react';

export default function SettingsModal({ open, onClose, addToast }) {
  const [dark, setDark] = useState(localStorage.getItem('darkMode') === 'true');
  const [textSize, setTextSize] = useState(parseInt(localStorage.getItem('textSize') || '16', 10));

  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('darkMode', String(dark));
    addToast(dark ? 'Dark mode enabled!' : 'Light mode enabled!', 'success');
  }, [dark, addToast]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${textSize}px`);
    localStorage.setItem('textSize', String(textSize));
  }, [textSize]);

  function reset() {
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    setDark(false);
    setTextSize(16);
    addToast('Settings reset to default!', 'success');
  }

  if (!open) return null;
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <div className="setting-group">
            <h3>Theme</h3>
            <div className="theme-toggle">
              <label className="switch">
                <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
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

          <button className="clear-btn" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>
  );
}


