// settings.js
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let textSize = parseInt(localStorage.getItem('textSize')) || 16;

document.addEventListener('DOMContentLoaded', function() {
  initializeSettings();
});

function initializeSettings() {
  // Apply dark mode
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').checked = true;
  }
  // Apply text size
  applyTextSize(textSize);
  document.getElementById('textSizeSlider').value = textSize;
  document.getElementById('textSizeValue').textContent = textSize;
  // Add event listeners for settings
  document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
  document.getElementById('textSizeSlider').addEventListener('input', function() {
    const size = this.value;
    setTextSize(size);
  });
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
  showMessage(isDarkMode ? 'Dark mode enabled!' : 'Light mode enabled!', 'success');
}

function setTextSize(size) {
  textSize = parseInt(size);
  applyTextSize(textSize);
  document.getElementById('textSizeSlider').value = textSize;
  document.getElementById('textSizeValue').textContent = textSize;
  localStorage.setItem('textSize', textSize);
  showMessage(`Text size set to ${textSize}px!`, 'success');
}

function applyTextSize(size) {
  const elements = document.querySelectorAll('textarea, button, label, .btn-text');
  elements.forEach(element => {
    element.style.fontSize = size + 'px';
  });
  // Adjust textarea height based on font size
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.style.height = Math.max(200, size * 12) + 'px';
  });
}

function showSettings() {
  const modal = document.getElementById("settingsModal");
  modal.style.display = "block";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function resetSettings() {
  if (confirm("Are you sure you want to reset all settings to default?")) {
    // Reset dark mode
    isDarkMode = false;
    document.body.classList.remove('dark-mode');
    document.getElementById('darkModeToggle').checked = false;
    localStorage.setItem('darkMode', false);
    // Reset text size
    textSize = 16;
    applyTextSize(16);
    document.getElementById('textSizeSlider').value = 16;
    document.getElementById('textSizeValue').textContent = '16';
    localStorage.setItem('textSize', 16);
    showMessage('Settings reset to default!', 'success');
  }
} 