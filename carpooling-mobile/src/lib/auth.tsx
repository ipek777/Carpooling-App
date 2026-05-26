import { createContext, useContext, useMemo, useState } from 'react';
import { API_BASE_URL } from './config';

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const error = data?.error || 'Login failed. Please try again.';
      return error;
    }

    const data = await response.json();
    const receivedToken = data?.token;
    if (!receivedToken || typeof receivedToken !== 'string') {
      return 'Login failed. Invalid server response.';
    }

    setToken(receivedToken);
    return null;
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
