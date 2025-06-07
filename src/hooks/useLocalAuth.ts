import { useState, useEffect } from 'react';

const CORRECT_PASSWORD = '55';
const AUTH_KEY = 'inventory_auth';
const SESSION_KEY = 'inventory_session';

export function useLocalAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check both permanent auth and session auth
    return localStorage.getItem(AUTH_KEY) === 'true' && 
           sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  useEffect(() => {
    // Store auth state in both localStorage and sessionStorage
    localStorage.setItem(AUTH_KEY, isAuthenticated.toString());
    sessionStorage.setItem(SESSION_KEY, isAuthenticated.toString());

    // Handle page unload/close
    const handleUnload = () => {
      // Keep the session active unless explicitly logged out
      sessionStorage.setItem(SESSION_KEY, isAuthenticated.toString());
    };

    // Handle visibility change (tab close/switch)
    const handleVisibilityChange = () => {
      // Only update session storage, don't log out
      if (document.visibilityState === 'visible') {
        // Restore session if auth is still valid
        if (localStorage.getItem(AUTH_KEY) === 'true') {
          sessionStorage.setItem(SESSION_KEY, 'true');
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const login = async (password: string) => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      throw new Error('パスワードが正しくありません');
    }
  };

  const logout = () => {
    // Only clear auth state when explicitly logging out
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return {
    isAuthenticated,
    login,
    logout
  };
}