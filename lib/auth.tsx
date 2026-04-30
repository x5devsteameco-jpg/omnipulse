'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  email: string;
  name: string;
  tenant: string;
  tier: 'starter' | 'pro' | 'enterprise';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS = [
  { email: 'demo@omnipulse.com', password: 'demo123', name: 'Demo User', tenant: 'demo-workspace', tier: 'enterprise' as const },
  { email: 'sabrina@omnipulse.com', password: 'sabrina123', name: 'Sabrina Carpenter', tenant: 'sabrina-carpenter', tier: 'enterprise' as const },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser({ email: found.email, name: found.name, tenant: found.tenant, tier: found.tier });
      try { localStorage.setItem('omnipulse_user', JSON.stringify(found)); } catch {}
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem('omnipulse_user'); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}