import React from 'react';

export default function Nav({ onNavigate, active }) {
  return (
    <div className="nav-bar">
      <div className="nav-inner">
        <div className="brand">
          <span className="brand-name">Somali ➜ English Translator</span>
        </div>
        <nav className="nav-tabs">
          <a className={active === 'home' ? 'active' : ''} href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Translation</a>
          <a className={active === 'history' ? 'active' : ''} href="/history">History</a>
          <a className={active === 'favorites' ? 'active' : ''} href="/favorites">Favorites</a>
          <a className={active === 'settings' ? 'active' : ''} href="/settings">Settings</a>
          <a className={active === 'admin' ? 'active' : ''} href="/admin">Admin Panel</a>
        </nav>
      </div>
    </div>
  );
}


