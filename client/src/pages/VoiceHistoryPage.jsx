import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed, api } from '../lib/api.js';

export default function VoiceHistoryPage() {
  const navigate = useNavigate();
  const [voiceTranslations, setVoiceTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [playingAudio, setPlayingAudio] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthed()) {
      navigate('/login');
      return;
    }
    
    loadVoiceHistory();
  }, [currentPage, navigate]);

  async function loadVoiceHistory() {
    try {
      setLoading(true);
      const data = await api(`/voice/history?page=${currentPage}&limit=20`);
      setVoiceTranslations(data.voice_translations || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError('Failed to load voice history: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function playAudio(voiceId, audioFilename) {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        playingAudio.pause();
        playingAudio.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(`/api/voice/${voiceId}/audio`);
      audio.addEventListener('ended', () => setPlayingAudio(null));
      audio.addEventListener('error', () => {
        setPlayingAudio(null);
        alert('Failed to play audio file');
      });

      setPlayingAudio(audio);
      await audio.play();
    } catch (err) {
      console.error('Audio playback error:', err);
      alert('Failed to play audio: ' + err.message);
    }
  }

  function stopAudio() {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
    }
  }

  async function deleteVoiceTranslation(voiceId) {
    if (!confirm('Are you sure you want to delete this voice translation?')) {
      return;
    }

    try {
      await api(`/voice/${voiceId}`, { method: 'DELETE' });
      // Reload the list
      loadVoiceHistory();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  async function clearAllVoiceHistory() {
    if (!confirm('Are you sure you want to delete ALL voice history? This cannot be undone.')) {
      return;
    }

    try {
      await api('/voice', { method: 'DELETE' });
      setVoiceTranslations([]);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (err) {
      alert('Failed to clear history: ' + err.message);
    }
  }

  function formatDate(timestamp) {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  }

  if (loading) {
    return (
      <div className="page-card">
        <div className="page-header">
          <h2>Voice History</h2>
        </div>
        <div className="page-body">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>Loading voice history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <h2>Voice History</h2>
      </div>
      <div className="page-body">
        {error && (
          <div style={{ 
            background: '#ffeaea', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}

        <div className="toolbar-row">
          <button 
            className="btn btn-outline" 
            onClick={loadVoiceHistory}
            style={{ margin: '0' }}
          >
            Refresh
          </button>
          {voiceTranslations.length > 0 && (
            <button 
              className="btn" 
              onClick={clearAllVoiceHistory}
              style={{ 
                margin: '0', 
                background: '#dc2626', 
                color: 'white', 
                borderColor: '#dc2626' 
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {voiceTranslations.length === 0 ? (
          <div className="empty">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No voice translations yet
              </div>
              <div style={{ color: '#6b7280' }}>
                Your voice recordings will appear here after you use the microphone feature
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="voice-list">
              {voiceTranslations.map((translation) => (
                <div key={translation._id} className="voice-item">
                  <div className="voice-content">
                    <div className="voice-header">
                      <div className="voice-info">
                        <div className="voice-filename">{translation.audio_filename}</div>
                        <div className="voice-date">{formatDate(translation.timestamp)}</div>
                      </div>
                      <div className="voice-actions">
                        <button
                          className="icon-btn"
                          onClick={() => playAudio(translation._id, translation.audio_filename)}
                          title="Play Audio"
                          style={{ 
                            background: playingAudio ? '#e7f7ee' : 'transparent',
                            color: playingAudio ? '#10b981' : '#4b5563'
                          }}
                        >
                          {playingAudio ? '⏸️' : '▶️'}
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => deleteVoiceTranslation(translation._id)}
                          title="Delete"
                          style={{ color: '#dc2626' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="voice-texts">
                      <div className="voice-original">
                        <strong>Somali:</strong> {translation.transcribed_text}
                      </div>
                      <div className="voice-translated">
                        <strong>English:</strong> {translation.translated_text}
                      </div>
                    </div>

                    {translation.language_detection && (
                      <div className="language-info">
                        <div className="detection-details">
                          <span className="detection-label">Language:</span>
                          <span className={`detection-value ${translation.language_detection.is_somali ? 'somali' : 'not-somali'}`}>
                            {translation.language_detection.detected_language === 'so' ? 'Somali' : translation.language_detection.detected_language}
                          </span>
                          <span className="confidence">
                            ({Math.round(translation.language_detection.language_confidence * 100)}% confidence)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-row">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span style={{ padding: '8px 12px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
