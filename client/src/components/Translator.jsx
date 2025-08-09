import React, { useEffect, useRef, useState } from 'react';
import { MicIcon, CopyIcon, ShareIcon, StarIcon, CloseIcon, VolumeIcon } from './icons.jsx';

export default function Translator({ addToast }) {
  const [somaliText, setSomaliText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const lastTranslationIdRef = useRef(null);
  const recognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const lastSpeechInputRef = useRef('');

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
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEnglishText(data.translated_text || '');
      lastTranslationIdRef.current = data.id || null;
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
    if (!s || !e || e === 'Translation' || e.includes('Error')) {
      addToast('Please translate something first!', 'error');
      return;
    }
    const id = lastTranslationIdRef.current;
    if (!id) { addToast('Translate first!', 'error'); return; }
    await fetch('/api/favorite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    addToast('Added to favorites!', 'success');
  }

  // Speech recognition
  useEffect(() => {
    const btn = document.getElementById('micSomaliBtn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!btn) return;
    if (!SpeechRecognition) {
      btn.disabled = true;
      btn.title = 'Speech recognition not supported';
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'so-SO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { recognizingRef.current = true; setIsRecording(true); };
    recognition.onend = () => { recognizingRef.current = false; setIsRecording(false); };
    recognition.onerror = (e) => { recognizingRef.current = false; setIsRecording(false); addToast('Speech recognition error: ' + e.error, 'error'); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      lastSpeechInputRef.current = transcript;
      setSomaliText(transcript);
      // auto-translate speech
      translateSpeechText(transcript);
    };
    recognitionRef.current = recognition;
    const handler = () => {
      if (recognizingRef.current) recognition.stop(); else recognition.start();
    };
    btn.addEventListener('click', handler);
    return () => { btn.removeEventListener('click', handler); recognition.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]);

  function translateSpeechText(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=so&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    setEnglishText('Translating...');
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const translation = data?.[0]?.map(item => item[0]).join(' ');
        setEnglishText(translation || 'Translation error');
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
              <button className="icon-btn" id="micSomaliBtn" title="Ku duub codka Somali">{isRecording ? <span className="rec-indicator" /> : <MicIcon />}</button>
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
        <button id="translateBtn" className="translate-btn-main" onClick={translate}>Translate</button>
      </div>
    </div>
  );
}


