import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config';

function Stat({ label, value, icon }) {
  return (
    <div className="card stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function QuickAction({ title, description, href, icon }) {
  return (
    <a className="card quick-action" href={href}>
      <div className="quick-action-icon">{icon}</div>
      <div className="quick-action-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="quick-action-arrow">→</div>
    </a>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [now, setNow] = useState(new Date());
  const [home, setHome] = useState(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadHome() {
      if (!currentUser?.token) return;
      setHomeLoading(true);
      setHomeError('');
      try {
        const res = await fetch(`${API_BASE}/api/home`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load home data');
        setHome(data);
      } catch (e) {
        setHomeError(e.message);
      } finally {
        setHomeLoading(false);
      }
    }
    loadHome();
  }, [currentUser]);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  return (
    <section>
      <div className="dashboard-header">
        <div>
          <h2>{greeting}, {currentUser?.name || currentUser?.email || 'Friend'} 👋</h2>
          <p>Welcome to your health dashboard. Here's what's happening today.</p>
        </div>
        <div className="current-time">
          {now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>

      <div className="grid">
        <Stat label="Nearby Services" value="8" icon="🏥" />
        <Stat label="Health Tips" value="12" icon="💡" />
        <Stat label="Telemedicine Slots" value="5" icon="💻" />
        <Stat label="Mental Health" value="24/7" icon="🧠" />
      </div>

      <div className="dashboard-section">
        <h3>Your Location</h3>
        <div className="card location-card">
          {homeLoading && (
            <div className="loading">
              <div className="spinner"></div>
              Loading your location data...
            </div>
          )}
          {homeError && <div className="error">{homeError}</div>}
          {!homeLoading && !homeError && home && (
            <div className="location-info">
              <div className="location-item">
                <span className="location-label">📍 Address:</span>
                <span className="location-value">{home.user?.address || 'Not provided'}</span>
              </div>
              <div className="location-item">
                <span className="location-label">🌍 Geocoded:</span>
                <span className="location-value">{home.location?.formattedAddress || 'Not available'}</span>
              </div>
              <div className="location-item">
                <span className="location-label">📡 GPS:</span>
                <span className="location-value">
                  {home.location ? `${home.location.latitude.toFixed(5)}, ${home.location.longitude.toFixed(5)}` : 'Not available'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="grid two">
          <QuickAction 
            title="Find Health Camps"
            description="Locate nearby blood donation and health camps"
            href="#/locator"
            icon="🏥"
          />
          <QuickAction 
            title="Health Education"
            description="Learn about preventive healthcare"
            href="#/education"
            icon="🎓"
          />
          <QuickAction 
            title="Telemedicine"
            description="Connect with healthcare providers"
            href="#/telemedicine"
            icon="💻"
          />
          <QuickAction 
            title="Mental Health"
            description="Chat with AI assistant for support"
            href="#/mental-health"
            icon="🧠"
          />
        </div>
      </div>
    </section>
  );
}


