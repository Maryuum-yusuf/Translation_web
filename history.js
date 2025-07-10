// history.js
async function fetchHistory() {
  const res = await fetch('http://127.0.0.1:5000/history');
  const data = await res.json();
  return data;
}

async function showHistory() {
  const modal = document.getElementById("historyModal");
  const historyList = document.getElementById("historyList");
  const history = await fetchHistory();

  if (history.length === 0) {
    historyList.innerHTML = "<p style='text-align: center; color: #666;'>No translation history yet.</p>";
  } else {
    // Sort by timestamp (newest first) - double check frontend sort
    const sortedHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    historyList.innerHTML = sortedHistory.map(item => `
      <div class="history-item">
        <div class="translation-text">
          <div class="somali-text">${item.original_text}</div>
          <div class="english-text">${item.translated_text}</div>
          <small style="color: #999;">${new Date(item.timestamp).toLocaleString()}</small>
        </div>
        <div class="item-actions">
          <button class="item-btn" onclick="copyText('${item.translated_text}')" title="Copy">📋</button>
          <button class="item-btn" onclick="removeFromHistory('${item._id}')" title="Remove">🗑️</button>
        </div>
      </div>
    `).join('');
  }
  modal.style.display = "block";

  setTimeout(() => {
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', function(e) {
        // Prevent click if clicking on a button inside the item
        if (e.target.closest('.item-btn')) return;
        const original = this.querySelector('.somali-text').textContent;
        const translated = this.querySelector('.english-text').textContent;
        sessionStorage.setItem('selectedTranslation', JSON.stringify({ original, translated }));
        closeHistory();
        // Go to main screen (index.html)
        window.location.href = 'index.html';
      });
    });
  }, 0);
}

async function removeFromHistory(id) {
  await fetch(`http://127.0.0.1:5000/history/${id}`, { method: 'DELETE' });
  showHistory();
  showMessage("Removed from history!", "success");
} 