// main.js
// Translation logic, copy/share, modals, showMessage, and helpers

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('translateBtn').addEventListener('click', translate);
  document.getElementById("somaliInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && event.ctrlKey) {
      translate();
    }
  });
  // Home button: reloads the page or hides all modals
  document.getElementById('nav-home').addEventListener('click', function(e) {
    e.preventDefault();
    // Haddii aad modals isticmaasho, xiro dhammaan modals
    closeHistory();
    closeFavorites();
    closeSettings();
    // Haddii aad rabto in aad page reload gareyso:
    // window.location.href = "index.html";
  });

  document.getElementById('nav-history').addEventListener('click', function(e) {
    e.preventDefault();
    showHistory();
  });

  document.getElementById('nav-favorites').addEventListener('click', function(e) {
    e.preventDefault();
    showFavorites();
  });

  document.getElementById('nav-settings').addEventListener('click', function(e) {
    e.preventDefault();
    showSettings();
  });
});

async function translate() {
  const input = document.getElementById("somaliInput").value.trim();
  const outputElement = document.getElementById("englishOutput");
  if (!input) {
    outputElement.value = "Please enter Somali text to translate";
    return;
  }
  outputElement.value = "Translating...";
  try {
    const response = await fetch("http://127.0.0.1:5000/translate", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ text: input })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    outputElement.value = data.translated_text;
    // Kaydi id-ga si aad ugu isticmaasho favorites
    window.lastTranslationId = data.id;
  } catch (error) {
    outputElement.value = `Error: ${error.message}. Please check if the API server is running.`;
  }
}

function copyTranslation() {
  const englishText = document.getElementById("englishOutput").value.trim();
  if (!englishText || englishText === "Translation" || englishText.includes("Error")) {
    showMessage("Nothing to copy!", "error");
    return;
  }
  copyToClipboard(englishText, "Translation copied!");
}

function copySomaliText() {
  const somaliText = document.getElementById("somaliInput").value.trim();
  if (!somaliText) {
    showMessage("No Somali text to copy!", "error");
    return;
  }
  copyToClipboard(somaliText, "Somali text copied!");
}

function copyEnglishText() {
  const englishText = document.getElementById("englishOutput").value.trim();
  if (!englishText || englishText === "Translation" || englishText.includes("Error")) {
    showMessage("No English text to copy!", "error");
    return;
  }
  copyToClipboard(englishText, "English text copied!");
}

function copyText(text) {
  copyToClipboard(text, "Copied!");
}

function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(() => {
    showMessage(msg, "success");
  }).catch(() => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showMessage(msg, "success");
  });
}

function shareTranslation() {
  const englishText = document.getElementById("englishOutput").value.trim();
  if (!englishText || englishText === "Translation" || englishText.includes("Error")) {
    showMessage("Nothing to share!", "error");
    return;
  }
  shareText(englishText);
}

function shareSomaliText() {
  const somaliText = document.getElementById("somaliInput").value.trim();
  if (!somaliText) {
    showMessage("No Somali text to share!", "error");
    return;
  }
  shareText(somaliText);
}

function shareEnglishText() {
  const englishText = document.getElementById("englishOutput").value.trim();
  if (!englishText || englishText === "Translation" || englishText.includes("Error")) {
    showMessage("No English text to share!", "error");
    return;
  }
  shareText(englishText);
}

function shareText(text) {
  if (navigator.share) {
    navigator.share({ title: 'Translation', text: text })
      .then(() => showMessage("Shared!", "success"))
      .catch(() => copyToClipboard(text, "Translation copied to clipboard!"));
  } else {
    copyToClipboard(text, "Translation copied to clipboard!");
  }
}

function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Modal close on outside click
window.onclick = function(event) {
  const historyModal = document.getElementById("historyModal");
  const favoritesModal = document.getElementById("favoritesModal");
  const settingsModal = document.getElementById("settingsModal");
  if (event.target === historyModal) closeHistory();
  if (event.target === favoritesModal) closeFavorites();
  if (event.target === settingsModal) closeSettings();
}; 

function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}
function closeFavorites() {
  document.getElementById("favoritesModal").style.display = "none";
}
function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function goHome() {
  closeHistory();
  closeFavorites();
  closeSettings();
  // Haddii aad rabto in aad page reload gareyso:
  // window.location.href = "index.html";
}
window.goHome = goHome; 

// Ku dar setupNavListeners si nav-ka u shaqeeyo marka nav.html la load-gareeyo
window.setupNavListeners = function() {
  document.getElementById('nav-home').addEventListener('click', function(e) {
    e.preventDefault();
    closeHistory();
    closeFavorites();
    closeSettings();
  });
  document.getElementById('nav-history').addEventListener('click', function(e) {
    e.preventDefault();
    showHistory();
  });
  document.getElementById('nav-favorites').addEventListener('click', function(e) {
    e.preventDefault();
    showFavorites();
  });
  document.getElementById('nav-settings').addEventListener('click', function(e) {
    e.preventDefault();
    showSettings();
  });
}; 