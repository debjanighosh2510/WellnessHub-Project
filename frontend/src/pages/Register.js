import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;
    return emailRegex.test(email);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!name || !email || !password) {
      setError('Name, email and password are required');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use a valid Gmail or Yahoo email address');
      setLoading(false);
      return;
    }
    
    try {
      await register({ name, email, password, address, coords });
      window.location.hash = '/dashboard';
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="auth-container">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join WellnessHub to access health services</p>
        
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
          </label>
          
          <label>
            Email Address (Gmail or Yahoo only)
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your Gmail or Yahoo email"
              disabled={loading}
              required
            />
            <small className="email-hint">Only @gmail.com and @yahoo.com addresses are allowed</small>
          </label>
          
          <label>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a secure password"
              disabled={loading}
              required
            />
          </label>
          
          <label>
            Address (Optional)
            <input 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Street, City, State"
              disabled={loading}
            />
          </label>
          
          <div className="location-info">
            <span className="tag">📍 Location</span>
            <div className="muted">
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'GPS location not available'}
            </div>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button 
            className="btn primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <a href="#/login" className="link">Sign in here</a></p>
        </div>
      </div>
    </section>
  );
}


