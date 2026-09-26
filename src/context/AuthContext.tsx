'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  login: (role: UserRole, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (newRole?: UserRole) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const DEFAULT_CANDIDATE: UserProfile = {
  id: 'cand-current',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'candidate',
  avatar: 'AR'
};

const DEFAULT_RECRUITER: UserProfile = {
  id: 'recruiter-lead',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@techcorp.com',
  role: 'recruiter',
  company: 'TechCorp Talent',
  avatar: 'SJ'
};

const AUTH_STORAGE_KEY = 'hirerank_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_CANDIDATE);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser(DEFAULT_CANDIDATE);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_CANDIDATE));
      }
    } catch (e) {
      setUser(DEFAULT_CANDIDATE);
    }
  }, []);

  const login = (newRole: UserRole, email?: string, name?: string) => {
    const profile: UserProfile =
      newRole === 'recruiter'
        ? {
            id: 'recruiter-lead',
            name: name || 'Sarah Jenkins',
            email: email || 'sarah.jenkins@techcorp.com',
            role: 'recruiter',
            company: 'TechCorp Talent',
            avatar: 'SJ'
          }
        : {
            id: 'cand-current',
            name: name || 'Alex Rivera',
            email: email || 'alex.rivera@example.com',
            role: 'candidate',
            avatar: 'AR'
          };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthModalOpen(true);
  };

  const switchRole = (overrideRole?: UserRole) => {
    const nextRole = overrideRole || (user?.role === 'recruiter' ? 'candidate' : 'recruiter');
    login(nextRole);
  };

  const role: UserRole = user?.role || 'candidate';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        logout,
        switchRole,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
