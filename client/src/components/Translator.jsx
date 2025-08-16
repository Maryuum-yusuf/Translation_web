import React, { useEffect, useRef, useState } from 'react';
import { MicIcon, CopyIcon, ShareIcon, StarIcon, CloseIcon, VolumeIcon } from './icons.jsx';
import { api, isAuthed, getAuth, logout, saveVoiceRecording, updateVoiceRecording } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';

export default function Translator({ addToast }) {
  const [somaliText, setSomaliText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const lastTranslationIdRef = useRef(null);
  const recognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const lastSpeechInputRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  // Fill from sessionStorage if navigated from history/favorites
  useEffect(() => {
    const selected = sessionStorage.getItem('selectedTranslation');
    if (selected) {
      try {
        const { original, translated } = JSON.parse(selected);
        setSomaliText(original || '');
        setEnglishText(translated || '');
      } catch {}
      sessionStorage.removeItem('selectedTranslation');
    }
  }, []);

  async function translate() {
    const input = somaliText.trim();
    if (!input) {
      setEnglishText('Please enter Somali text to translate');
      return;
    }
    setEnglishText('Translating...');
    try {
      const data = await api('/translate', {
        method: 'POST',
        body: { text: input }
      });
      
      console.log('API Response:', data); // Debug logging
      
      // Check for error message in response (even if status is 200)
      if (data.error) {
        console.log('Backend Error:', data.error); // Debug logging
        setEnglishText(data.error);
        return;
      }
      
      setEnglishText(data.translated_text || '');
      lastTranslationIdRef.current = data.id || null;
      
      // Note: History is automatically saved by the backend translation endpoint
      // No need to save again here to avoid duplicates
    } catch (e) {
      setEnglishText(`Error: ${e.message}. Please check if the API server is running.`);
    }
  }

  function copyToClipboard(text, ok = 'Copied!') {
    if (!text) { addToast('Nothing to copy!', 'error'); return; }
    navigator.clipboard.writeText(text).then(() => addToast(ok, 'success'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        addToast(ok, 'success');
      });
  }

  function shareText(text) {
    if (!text) { addToast('Nothing to share!', 'error'); return; }
    if (navigator.share) {
      navigator.share({ title: 'Translation', text }).catch(() => {});
    } else {
      try { navigator.clipboard.writeText(text); } catch {}
    }
  }

  async function addToFavorites() {
    const s = somaliText.trim();
    const e = englishText.trim();
    if (!s || !e || e.includes('Error') || e.includes('Processing') || e === 'Translating...') {
      addToast('Please translate something first!', 'error');
      return;
    }
    
    // Check if user is logged in
    if (!isAuthed()) {
      addToast('Please login to save favorites!', 'error');
      return;
    }
    
    const id = lastTranslationIdRef.current;
    
    try {
      if (id) {
        // If we have a translation ID from backend, use it
        await api('/favorite', { method: 'POST', body: { id } });
        addToast('Added to favorites!', 'success');
      } else {
        // For voice recordings or fallback translations, save directly
        await api('/favorite', { method: 'POST', body: { 
          original_text: s, 
          translated_text: e,
          source: 'voice' // Mark as voice recording
        }});
        addToast('added to favorites!', 'success');
      }
    } catch (err) {
      addToast('Failed to add to favorites: ' + err.message, 'error');
    }
  }

  // Voice recording and processing
  async function startVoiceRecording() {
    // Check if user is logged in for voice recording
    if (!isAuthed()) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition immediately for live transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        addToast('Speech recognition not supported in this browser', 'error');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'so-SO';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        
        finalTranscript += final;
        interimTranscript = interim;
        
        // Update Somali text in real-time
        setSomaliText(finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          addToast('No speech detected. Please try again.', 'error');
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setIsProcessingVoice(true);
        setEnglishText('Processing voice recording...');
        
        // Process the final transcript
        processVoiceRecording(finalTranscript, stream);
      };
      
      // Start recording audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Stop speech recognition when audio recording stops
        recognition.stop();
      };
      
      // Start both recording and recognition
      mediaRecorder.start();
      recognition.start();
      setIsRecording(true);
      addToast('Recording started... Click again to stop', 'success');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      addToast('Could not access microphone. Please check permissions.', 'error');
    }
  }
  
  async function processVoiceRecording(transcribedText, stream) {
    try {
      if (!transcribedText.trim()) {
        setEnglishText('No speech detected. Please try again.');
        setIsProcessingVoice(false);
        return;
      }
      
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Upload to backend for language detection and translation
      await uploadVoiceToBackend(audioBlob, transcribedText);
      
    } catch (error) {
      console.error('Voice processing error:', error);
      setEnglishText('Error processing voice recording. Please try again.');
    } finally {
      setIsProcessingVoice(false);
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    }
  }
  
  function stopVoiceRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }
  

  
  async function uploadVoiceToBackend(audioBlob, transcribedText) {
    try {
      // Check if user is authenticated
      if (!isAuthed()) {
        // If no token, just show the transcribed text and use Google Translate
        setEnglishText('Processing transcription...');
        
        // Use Google Translate as fallback
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(transcribedText)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        const translation = data?.[0]?.map(item => item[0]).join(' ');
        console.log('Non-authenticated translation:', translation);
        setEnglishText(translation || '');
        addToast('Voice transcribed and translated! (No database storage - please login for full features)', 'success');
        return;
      }
      
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      // Create data URL
      const audioDataUrl = `data:audio/webm;base64,${base64Audio}`;
      
      // Calculate duration (approximate)
      const duration = audioBlob.size / 16000; // Rough estimate based on file size
      
      // Save voice recording to backend
      try {
        const data = await saveVoiceRecording({
          audio_data: audioDataUrl,
          duration: duration,
          language: 'Somali',
          transcription: transcribedText,
          translation: '' // Will be filled by backend
        });
        
        if (data.error) {
          setEnglishText(data.error);
          addToast('Voice recording saved but translation failed', 'error');
        } else {
          // The backend now automatically translates, so we can use the returned translation
          console.log('Backend response:', data);
          let translatedText = data.translation || '';
          
          // If backend didn't return translation, use Google Translate as fallback
          if (!translatedText) {
            console.log('No translation from backend, using Google Translate fallback');
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(transcribedText)}`;
            const fallbackResponse = await fetch(url);
            const fallbackData = await fallbackResponse.json();
            translatedText = fallbackData?.[0]?.map(item => item[0]).join(' ') || '';
          }
          
          console.log('Setting translation to:', translatedText);
          setEnglishText(translatedText);
          
          addToast('Voice recording saved and translated!', 'success');
        }
      } catch (error) {
        console.log('Voice recording save failed, using fallback translation');
        
        // Fallback to Google Translate
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(transcribedText)}`;
        const fallbackResponse = await fetch(url);
        const fallbackData = await fallbackResponse.json();
        
        const translation = fallbackData?.[0]?.map(item => item[0]).join(' ');
        setEnglishText(translation);
        addToast('Voice transcribed and translated! (No database storage)', 'success');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to Google Translate on any error
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(transcribedText)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        const translation = data?.[0]?.map(item => item[0]).join(' ');
        setEnglishText(translation || '');
        addToast('Voice transcribed and translated! (No database storage)', 'success');
      } catch (fallbackError) {
        setEnglishText('Error processing voice recording. Please try again.');
      }
    }
  }

  function translateSpeechText(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    setEnglishText('Translating...');
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const translation = data?.[0]?.map(item => item[0]).join(' ');
        setEnglishText(translation || '');
      })
      .catch(() => setEnglishText('Translation error'));
  }

  // Clear both boxes at once
  function clearBoth() { setSomaliText(''); setEnglishText(''); }

  return (
    <div className="page">
      <div className="translator">
        <div className="column">
          <label htmlFor="somaliInput">Somali</label>
          <div className="box">
            <button className="icon-btn corner top-right" onClick={clearBoth} title="Clear both"><CloseIcon /></button>
            <textarea id="somaliInput" placeholder="type here" value={somaliText} onChange={(e) => {
              const value = e.target.value;
              setSomaliText(value);
              if (value !== lastSpeechInputRef.current) setEnglishText('');
            }} />
            <div className="corner bottom-left actions">
              <button 
                className="icon-btn" 
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                title={isRecording ? "Click to stop recording" : (isAuthed() ? "Ku duub codka Somali" : "Login required for voice recording")}
                disabled={isProcessingVoice}
                style={{ opacity: isProcessingVoice ? 0.5 : 1 }}
              >
                {isRecording ? <span className="rec-indicator" /> : <MicIcon />}
              </button>
              <button className="icon-btn" onClick={() => copyToClipboard(somaliText, 'Somali text copied!')} title="Copy Somali Text"><CopyIcon /></button>
            </div>
          </div>
        </div>

        <div className="column">
          <label htmlFor="englishOutput">English</label>
          <div className="box">
            <button className="icon-btn corner top-right" onClick={addToFavorites} title="Add to Favorites"><StarIcon /></button>
            <textarea id="englishOutput" placeholder="Translation" value={englishText} readOnly />
            <div className="corner bottom-right actions">
              <button className="icon-btn" onClick={() => copyToClipboard(englishText, 'English text copied!')} title="Copy English Text"><CopyIcon /></button>
              <button className="icon-btn" onClick={() => shareText(englishText)} title="Share English Text"><ShareIcon /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="center-actions-below">
        <button 
          id="translateBtn" 
          className="translate-btn-main" 
          onClick={translate}
          disabled={isProcessingVoice}
        >
          {isProcessingVoice ? 'Processing Voice...' : 'Translate'}
        </button>
      </div>

      {/* Login/Register Modal */}
      {showLoginModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Login Required</h3>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Voice translation requires login. Please login or register to use this feature.</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/register')}>
                  Register
                </button>
                <button className="btn btn-outline" onClick={() => setShowLoginModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


