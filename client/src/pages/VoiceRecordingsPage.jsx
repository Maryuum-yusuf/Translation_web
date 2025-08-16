import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVoiceRecordings, deleteVoiceRecording, toggleFavoriteRecording, getVoiceAudioData, isAuthed } from '../lib/api.js';

export default function VoiceRecordingsPage({ addToast }) {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    if (!isAuthed()) {
      navigate('/login');
      return;
    }
    loadRecordings();
  }, [navigate]);

  async function loadRecordings() {
    try {
      setLoading(true);
      const data = await getVoiceRecordings();
      setRecordings(data);
    } catch (err) {
      setError('Failed to load voice recordings: ' + err.message);
      console.error('Voice recordings error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayRecording(recording) {
    try {
      if (playingId === recording._id) {
        // Stop current playback
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        setPlayingId(null);
        setAudioElement(null);
        return;
      }

      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
      }

      // Get audio data
      const audioData = await getVoiceAudioData(recording._id);
      const audioBlob = new Blob([Uint8Array.from(atob(audioData.audio_data), c => c.charCodeAt(0))], { 
        type: recording.mime_type || 'audio/webm' 
      });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingId(null);
        setAudioElement(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
      setPlayingId(recording._id);
      setAudioElement(audio);
    } catch (err) {
      addToast && addToast('Failed to play recording: ' + err.message, 'error');
    }
  }

  async function handleDeleteRecording(recordingId) {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    
    try {
      await deleteVoiceRecording(recordingId);
      setRecordings(prev => prev.filter(r => r._id !== recordingId));
      addToast && addToast('Recording deleted successfully!', 'success');
    } catch (err) {
      addToast && addToast('Failed to delete recording: ' + err.message, 'error');
    }
  }

  async function handleToggleFavorite(recordingId) {
    try {
      await toggleFavoriteRecording(recordingId);
      setRecordings(prev => prev.map(r => 
        r._id === recordingId ? { ...r, is_favorite: !r.is_favorite } : r
      ));
      addToast && addToast('Favorite status updated!', 'success');
    } catch (err) {
      addToast && addToast('Failed to update favorite: ' + err.message, 'error');
    }
  }

  function formatDate(timestamp) {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-card">
          <div className="page-header"><h2>Voice Recordings</h2></div>
          <div className="page-body">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Loading voice recordings...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-card">
          <div className="page-header"><h2>Voice Recordings</h2></div>
          <div className="page-body">
            <div style={{ 
              background: '#ffeaea', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px' 
            }}>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-card">
        <div className="page-header">
          <h2>Voice Recordings</h2>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="page-body">
          {recordings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280' 
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎤</div>
              <div>No voice recordings yet</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                Record your voice to see it here
              </div>
            </div>
          ) : (
            <div className="voice-list">
              {recordings.map((recording) => (
                <div key={recording._id} className="voice-item">
                  <div className="voice-header">
                    <div className="voice-info">
                      <div className="voice-filename">
                        {recording.filename || `Recording ${recording._id.slice(-6)}`}
                      </div>
                      <div className="voice-date">
                        {formatDate(recording.timestamp)} • {formatDuration(recording.duration || 0)}
                      </div>
                    </div>
                    <div className="voice-actions">
                      <button
                        onClick={() => handlePlayRecording(recording)}
                        style={{
                          background: playingId === recording._id ? '#dc2626' : '#1a73e8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {playingId === recording._id ? '⏹️ Stop' : '▶️ Play'}
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(recording._id)}
                        style={{
                          background: recording.is_favorite ? '#fbbf24' : '#f3f4f6',
                          color: recording.is_favorite ? '#92400e' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {recording.is_favorite ? '⭐ Favorited' : '☆ Favorite'}
                      </button>
                      <button
                        onClick={() => handleDeleteRecording(recording._id)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="voice-texts">
                    <div className="voice-original">
                      <strong>Original:</strong> {recording.transcription || 'No transcription'}
                    </div>
                    <div className="voice-translated">
                      <strong>Translation:</strong> {recording.translation || 'No translation'}
                    </div>
                  </div>
                  
                  <div className="language-info">
                    <div className="detection-details">
                      <span className="detection-label">Language:</span>
                      <span className="detection-value somali">{recording.language || 'Somali'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
