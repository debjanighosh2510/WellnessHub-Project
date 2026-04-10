import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API_BASE from '../config';

const CURRENT_USER_KEY = 'hh308_current_user_v1';

const AuthContext = createContext({
  currentUser: null,
  login: async (_email, _password) => null,
  register: async (_payload) => null,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(CURRENT_USER_KEY);
      if (rawUser) setCurrentUser(JSON.parse(rawUser));
    } catch (_) {
      // ignore
    }
  }, []);

  const persistUser = useCallback((user) => {
    setCurrentUser(user || null);
    try {
      if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(CURRENT_USER_KEY);
    } catch (_) {
      // ignore
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Login failed');
    }
    const userWithToken = { ...data.user, token: data.token };
    persistUser(userWithToken);
    return userWithToken;
  }, [persistUser]);

  const register = useCallback(async (payload) => {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        address: payload.address || '',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Registration failed');
    }
    const userWithToken = { ...data.user, token: data.token };
    persistUser(userWithToken);
    return userWithToken;
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(() => ({ currentUser, login, register, logout }), [currentUser, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

  