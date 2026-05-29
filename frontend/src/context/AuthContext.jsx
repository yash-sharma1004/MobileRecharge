import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      // Safety: If it's a known demo user like 'Reena Sharma', treat as null for fresh start
      if (parsed?.name === "Reena Sharma") {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    // If user was cleared above, token should also be cleared
    if (!localStorage.getItem('user')) return null;
    return localStorage.getItem('token') || null;
  });

  const isAuthenticated = !!token && !!user;

  // Login — called after successful API login/register
  const login = useCallback((userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  }, []);

  // Logout — clears all auth + user-specific localStorage data
  const logout = useCallback(() => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear legacy localStorage keys (leftover from old architecture)
    localStorage.removeItem('rechargeHistory');
    localStorage.removeItem('walletBalance');
    localStorage.removeItem('walletHistory');
    localStorage.removeItem('referralEarnings');
    localStorage.removeItem('referralHistory');
    localStorage.removeItem('rechargeExpiry');
    localStorage.removeItem('lastRecharge');

    setUser(null);
    setToken(null);
  }, []);

  // Listen for forced logout from api.js (401 responses)
  useEffect(() => {
    const handleForceLogout = () => logout();
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
