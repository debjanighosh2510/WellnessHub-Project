import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config';

function distanceKm(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat/2) ** 2 + Math.sin(dLon/2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return +(R * d).toFixed(2);
}

const MOCK_SERVICES = [];

export default function Locator() {
  const { currentUser } = useAuth();
  const [coords, setCoords] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setError('Could not get your location'),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    async function fetchNearest() {
      if (!currentUser?.token) return;
      try {
        const res = await fetch(`${API_BASE}/api/nearest-camps`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load services');
        const mapped = (data.camps || []).map((c) => ({
          id: String(c.id),
          type: c.type,
          name: c.name,
          lat: c.latitude,
          lng: c.longitude,
          address: c.address,
        }));
        setServices(mapped);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchNearest();
  }, [currentUser]);

  const listed = useMemo(() => {
    const base = services.length ? services : MOCK_SERVICES;
    return base
      .map((s) => ({ ...s, distance: distanceKm(coords, { lat: s.lat, lng: s.lng }) }))
      .sort((a, b) => a.distance - b.distance);
  }, [coords, services]);

  return (
    <section>
      <h2>Nearby Health Services</h2>
      <div className="muted">Your GPS: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Detecting...'}</div>
      {error && <div className="error">{error}</div>}
      <ul className="list">
        {listed.map((s) => (
          <li key={s.id} className="card">
            <div className="tag">{s.type}</div>
            <div className="title">{s.name}</div>
            <div className="muted">{s.distance} km away{s.address ? ` • ${s.address}` : ''}</div>
            <div className="row">
              <a className="btn" href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" rel="noreferrer">Open Map</a>
              <a className="btn secondary" href="#/report">Report/Request</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}


