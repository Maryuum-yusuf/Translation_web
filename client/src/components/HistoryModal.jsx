import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HistoryModal({ open, onClose, addToast }) {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        const sorted = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setItems(sorted);
      } catch (e) {
        addToast('Failed to load history', 'error');
      }
    })();
  }, [open, addToast]);

  async function removeItem(id) {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
    addToast('Removed from history!', 'success');
    const res = await fetch('/api/history');
    const data = await res.json();
    setItems((data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
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
          <h2>Translation History</h2>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          {items.length === 0 && (<p style={{ textAlign: 'center', color: '#666' }}>No translation history yet.</p>)}
          {items.map(item => (
            <div className="history-item" key={item._id} onClick={(e) => { if (e.target.closest('.item-btn')) return; choose(item); }}>
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
        </div>
      </div>
    </div>
  );
}


