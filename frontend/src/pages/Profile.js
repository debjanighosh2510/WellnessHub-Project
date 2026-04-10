import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config';

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser?.token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load profile');
        setProfile(data.user || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [currentUser]);

  return (
    <section>
      <h2>My Profile</h2>
      {loading && <div className="muted">Loading…</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && profile && (
        <div className="card">
          <div className="row"><strong>Name:</strong>&nbsp;<span>{profile.name || '—'}</span></div>
          <div className="row"><strong>Email:</strong>&nbsp;<span>{profile.email || '—'}</span></div>
          <div className="row"><strong>Address:</strong>&nbsp;<span>{profile.address || '—'}</span></div>
        </div>
      )}
    </section>
  );
}


