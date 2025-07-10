// favorites.js
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

async function fetchFavorites() {
  const res = await fetch('http://127.0.0.1:5000/favorites');
  const data = await res.json();
  return data;
}

async function showFavorites() {
  const modal = document.getElementById("favoritesModal");
  const favoritesList = document.getElementById("favoritesList");
  const favorites = await fetchFavorites();

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p style='text-align: center; color: #666;'>No favorites yet.</p>";
  } else {
    // Sort by timestamp (newest first) - double check frontend sort
    const sortedFavorites = favorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    favoritesList.innerHTML = sortedFavorites.map(item => `
      <div class="favorite-item">
        <div class="translation-text">
          <div class="somali-text">${item.original_text}</div>
          <div class="english-text">${item.translated_text}</div>
          <small style="color: #999;">${new Date(item.timestamp).toLocaleString()}</small>
        </div>
        <div class="item-actions">
          <button class="item-btn" onclick="copyText('${item.translated_text}')" title="Copy">📋</button>
          <button class="item-btn" onclick="removeFromFavorites('${item._id}')" title="Remove">🗑️</button>
        </div>
      </div>
    `).join('');
  }
  modal.style.display = "block";

  setTimeout(() => {
    document.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', function(e) {
        // Prevent click if clicking on a button inside the item
        if (e.target.closest('.item-btn')) return;
        const original = this.querySelector('.somali-text').textContent;
        const translated = this.querySelector('.english-text').textContent;
        sessionStorage.setItem('selectedTranslation', JSON.stringify({ original, translated }));
        closeFavorites();
        // Go to main screen (index.html)
        window.location.href = 'index.html';
      });
    });
  }, 0);
}

function closeFavorites() {
  document.getElementById("favoritesModal").style.display = "none";
}

async function removeFromFavorites(id) {
  await fetch(`http://127.0.0.1:5000/favorites/${id}`, { method: 'DELETE' });
  showFavorites();
  showMessage("Removed from favorites!", "success");
}

async function clearAllFavorites() {
  if (confirm("Are you sure you want to clear all favorites?")) {
    await fetch('http://127.0.0.1:5000/favorites', { method: 'DELETE' });
    showFavorites();
    showMessage("All favorites cleared!", "success");
  }
}

async function addToFavorites() {
  const somaliText = document.getElementById("somaliInput").value.trim();
  const englishText = document.getElementById("englishOutput").value.trim();
  if (!somaliText || !englishText || englishText === "Translation" || englishText.includes("Error")) {
    showMessage("Please translate something first!", "error");
    return;
  }
  // Hel id-ga translation-kii ugu dambeeyay (waa in aad kaydiso id-ga marka aad translate sameyso)
  const lastId = window.lastTranslationId;
  if (!lastId) {
    showMessage("Translate first!", "error");
    return;
  }
  await fetch('http://127.0.0.1:5000/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: lastId })
  });
  showMessage("Added to favorites!", "success");
  
} 