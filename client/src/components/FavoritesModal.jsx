import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function FavoritesModal({ open, onClose, addToast }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await api('/favorites');
        const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setItems(sorted);
      } catch (e) {
        addToast('Failed to load favorites: ' + e.message, 'error');
      }
    })();
  }, [open, addToast]);

  async function removeItem(id) {
    try {
      await api(`/favorites/${id}`, { method: 'DELETE' });
      addToast('Removed from favorites!', 'success');
      const data = await api('/favorites');
      setItems((data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (e) {
      addToast('Failed to remove item: ' + e.message, 'error');
    }
  }

  async function clearAllFavorites() {
    if (!confirm('Are you sure you want to clear all favorites?')) return;
    try {
      await api('/favorites', { method: 'DELETE' });
      addToast('All favorites cleared!', 'success');
      setItems([]);
    } catch (e) {
      addToast('Failed to clear favorites: ' + e.message, 'error');
    }
  }

  function choose(item) {
    sessionStorage.setItem('selectedTranslation', JSON.stringify({ original: item.original_text, translated: item.translated_text }));
    onClose();
    navigate('/');
  }

  if (!open) return null;
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Favorites</h2>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          {items.length === 0 && (<p style={{ textAlign: 'center', color: '#666' }}>No favorites yet.</p>)}
          {items.map(item => (
            <div className="favorite-item" key={item._id} onClick={(e) => { if (e.target.closest('.item-btn')) return; choose(item); }}>
              <div className="translation-text">
                <div className="somali-text">{item.original_text}</div>
                <div className="english-text">{item.translated_text}</div>
                <small style={{ color: '#999' }}>{new Date(item.timestamp).toLocaleString()}</small>
              </div>
              <div className="item-actions">
                <button className="item-btn" title="Copy" onClick={() => navigator.clipboard.writeText(item.translated_text)}>📋</button>
                <button className="item-btn" title="Remove" onClick={() => removeItem(item._id)}>🗑️</button>
              </div>
            </div>
          ))}
          <button className="clear-btn" onClick={clearAllFavorites}>Clear All Favorites</button>
        </div>
      </div>
    </div>
  );
}


