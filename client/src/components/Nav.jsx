import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed, getAuth, logout } from '../lib/api.js';

export default function Nav({ active }) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const auth = getAuth();
  const isLoggedIn = isAuthed();

  const handleNavClick = (section) => {
    // Check if user is logged in for protected features
    if (!isLoggedIn && (section === 'history' || section === 'favorites' || section === 'voice-recordings')) {
      setShowLoginModal(true);
      return;
    }
    
    // Navigate using React Router
    switch (section) {
      case 'home':
        navigate('/');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'voice-recordings':
        navigate('/voice-recordings');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate to home page after logout
  };

  return (
    <>
      <div className="nav-bar">
        <div className="nav-inner">
          <div className="brand">
            <span className="brand-name">Somali ➜ English Translator</span>
          </div>
          <nav className="nav-tabs">
            <a 
              className={active === 'home' ? 'active' : ''} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            >
              Translation
            </a>
            <a 
              className={active === 'history' ? 'active' : ''} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('history'); }}
            >
              History
            </a>
            <a 
              className={active === 'favorites' ? 'active' : ''} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('favorites'); }}
            >
              Favorites
            </a>
          
            <a 
              className={active === 'settings' ? 'active' : ''} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('settings'); }}
            >
              Settings
            </a>
            <a 
              className={active === 'voice-recordings' ? 'active' : ''} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('voice-recordings'); }}
            >
              Voice Recordings
            </a>
            <a className={active === 'admin' ? 'active' : ''} href="/admin/login">Sign Up</a>
          </nav>
          
          {/* User Profile Section */}
          <div className="user-profile">
            {isLoggedIn ? (
              <div className="user-info">
                <span className="user-name">{auth?.fullName || auth?.email || 'User'}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
              
              </div>
            )}
          </div>
        </div>
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
              <p>Please login or register to access this feature.</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                
              </p>
              <div className="modal-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                >
                  Login
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/register');
                  }}
                >
                  Register
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


