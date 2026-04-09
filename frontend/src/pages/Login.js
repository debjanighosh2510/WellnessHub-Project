import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login({ redirectTo }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;
    return emailRegex.test(email);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use a valid Gmail or Yahoo email address');
      setLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      window.location.hash = redirectTo || '/dashboard';
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your WellnessHub account</p>
        
        <form className="form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </label>
          
          {error && <div className="error">{error}</div>}
          
          <button 
            className="btn primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <a href="#/register" className="link">Create one now</a></p>
        </div>
      </div>
    </section>
  );
}


