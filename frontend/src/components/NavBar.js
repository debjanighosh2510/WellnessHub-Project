import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

function Link({ to, children }) {
  const active = useMemo(() => (window.location.hash.replace('#', '') || '/') === to, [to]);
  return (
    <a href={`#${to}`} className={active ? 'nav-link active' : 'nav-link'}>{children}</a>
  );
}

export default function NavBar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="brand">
        <a href="#/" className="brand-link">
          <span className="brand-icon">🏥</span>
          WellnessHub
        </a>
      </div>
      
      <nav className="nav">
        <Link to="/education">Education</Link>
        <Link to="/locator">Find Camps</Link>
        <Link to="/telemedicine">Telemedicine</Link>
        <Link to="/mental-health">Mental Health</Link>
        <Link to="/feedback">Feedback</Link>
      </nav>
      
      <div className="auth">
        {currentUser ? (
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">{currentUser.name || 'User'}</span>
              <span className="user-email">{currentUser.email}</span>
            </div>
            <div className="user-actions">
              <a className="btn" href="#/profile">Profile</a>
              <button 
                className="btn secondary" 
                onClick={() => { 
                  logout(); 
                  window.location.hash = '/'; 
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-links">
            <a className="btn" href="#/login">Sign In</a>
            <a className="btn primary" href="#/register">Get Started</a>
          </div>
        )}
      </div>
    </header>
  );
}


