'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isInitialized: boolean;
  login: (role: UserRole, email?: string, name?: string, company?: string) => void;
  logout: () => void;
  switchRole: (newRole?: UserRole) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AUTH_STORAGE_KEY = 'hirerank_auth_user_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // No auto-login on fresh start: prompts user to choose role first
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (newRole: UserRole, email?: string, name?: string, company?: string) => {
    let profile: UserProfile;

    if (newRole === 'recruiter') {
      profile = {
        id: email ? `recruiter-${email.replace(/[^a-zA-Z0-9]/g, '')}` : 'recruiter-lead',
        name: name || 'Sarah Jenkins',
        email: email || 'sarah.jenkins@techcorp.com',
        role: 'recruiter',
        company: company || 'TechCorp Talent',
        avatar: (name ? name.slice(0, 2) : 'SJ').toUpperCase()
      };
    } else {
      profile = {
        id: email ? `cand-${email.replace(/[^a-zA-Z0-9]/g, '')}` : 'cand-alex',
        name: name || 'Alex Rivera',
        email: email || 'alex.rivera@example.com',
        role: 'candidate',
        avatar: (name ? name.slice(0, 2) : 'AR').toUpperCase()
      };
    }

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
        isInitialized,
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

