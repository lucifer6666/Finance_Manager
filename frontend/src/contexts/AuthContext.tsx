import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthUrl } from '../config/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsAuthenticated(true);
      setUser(username);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const authUrl = getAuthUrl();
      const response = await fetch(`${authUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('username', username);
      setIsAuthenticated(true);
      setUser(username);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
