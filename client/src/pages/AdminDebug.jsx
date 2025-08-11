import React, { useState, useEffect } from 'react';
import { getAuth, isAdmin, isAuthed } from '../lib/api.js';

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const decoded = atob(padded);
    const escaped = decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('');
    return JSON.parse(decodeURIComponent(escaped));
  } catch {
    return null;
  }
}

export default function AdminDebug() {
  const [authState, setAuthState] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const token = auth?.token || localStorage.getItem('auth_token');
    const decodedToken = token ? decodeJwt(token) : null;
    
    setAuthState({
      auth,
      isAuthed: isAuthed(),
      isAdmin: isAdmin(),
      decodedToken,
      localStorage: {
        auth: localStorage.getItem('auth'),
        auth_token: localStorage.getItem('auth_token'),
        auth_role: localStorage.getItem('auth_role'),
        adminAuthed: localStorage.getItem('adminAuthed')
      }
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Authentication Debug</h2>
      <pre>{JSON.stringify(authState, null, 2)}</pre>
    </div>
  );
}
