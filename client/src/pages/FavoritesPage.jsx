import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed, api } from '../lib/api.js';

export default function FavoritesPage({ addToast }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthed()) {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        const data = await api('/favorites');
        const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setItems(sorted);
      } catch (e) {
        addToast && addToast('Failed to load favorites: ' + e.message, 'error');
      }
    })();
  }, [addToast, navigate]);

  async function removeItem(id) {
    try {
      await api(`/favorites/${id}`, { method: 'DELETE' });
      addToast && addToast('Removed from favorites!', 'success');
      const data = await api('/favorites');
      setItems((data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (e) {
      addToast && addToast('Failed to remove item: ' + e.message, 'error');
    }
  }

  async function clearAll() {
    if (!confirm('Clear all favorites?')) return;
    try {
      await api('/favorites', { method: 'DELETE' });
      addToast && addToast('All favorites cleared!', 'success');
      setItems([]);
    } catch (e) {
      addToast && addToast('Failed to clear favorites: ' + e.message, 'error');
    }
  }

  function choose(item) {
    sessionStorage.setItem('selectedTranslation', JSON.stringify({ original: item.original_text, translated: item.translated_text }));
    navigate('/');
  }

  return (
    <div className="page">
      <div className="page-card">
        <div className="page-header"><h2>Favorites</h2></div>
        <div className="page-body">
          {items.length === 0 && (<p style={{ textAlign: 'center', color: '#666' }}>No favorites yet.</p>)}
          {items.map(item => (
            <div className="favorite-item" key={item._id} onClick={(e) => { if (e.target.closest('.item-btn')) return; choose(item); }}>
              <div className="translation-text">
                <div className="somali-text">{item.original_text}</div>
                <div className="english-text">{item.translated_text}</div>
                <small style={{ color: '#999' }}>{new Date(item.timestamp).toLocaleString()}</small>
              </div>
              <div className="item-actions">
                <button className="item-btn" title="Copy" onClick={() => navigator.clipboard.writeText(item.translated_text)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button className="item-btn" title="Remove" onClick={() => removeItem(item._id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
          {items.length > 0 && (
            <button className="clear-btn" onClick={clearAll}>Clear All Favorites</button>
          )}
        </div>
      </div>
    </div>
  );
}


