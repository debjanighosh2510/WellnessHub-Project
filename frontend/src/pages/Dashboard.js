import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function Stat({ label, value }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
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
        const res = await fetch('/api/home', {
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
      <h2>{greeting}, {currentUser?.name || currentUser?.email || 'Friend'} 👋</h2>
      <p>Here is a quick overview and shortcuts.</p>
      <div className="card">
        <div className="title">Your location</div>
        {homeLoading && <div className="muted">Loading your home data…</div>}
        {homeError && <div className="error">{homeError}</div>}
        {!homeLoading && !homeError && home && (
          <div>
            <div className="muted">Registered address: {home.user?.address || '—'}</div>
            <div className="muted">Geocoded: {home.location?.formattedAddress || '—'}</div>
            <div className="muted">GPS: {home.location ? `${home.location.latitude.toFixed(5)}, ${home.location.longitude.toFixed(5)}` : '—'}</div>
          </div>
        )}
      </div>
      <div className="grid">
        <Stat label="Nearby Services" value="8" />
        <Stat label="Open Campaigns" value="3" />
        <Stat label="Reports Pending" value="2" />
        <Stat label="Telemedicine Slots" value="5" />
      </div>
      <div className="grid two">
        <a className="card link" href="#/locator">Find services near me →</a>
        <a className="card link" href="#/report">Report a case →</a>
        <a className="card link" href="#/telemedicine">Consult a doctor →</a>
        <a className="card link" href="#/education">Wellness education →</a>
      </div>
    </section>
  );
}


