'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Helper function to extract display name from email
export function getDisplayName(email: string): string {
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper function to get initials from email
export function getInitials(email: string): string {
  const name = email.split('@')[0];
  if (name === 'tim') return 'TN'; // Tim Northstar
  if (name === 'omiah') return 'OT'; // Omiah Team
  
  // Fallback: first letter + 'N' for Northstar
  return name.charAt(0).toUpperCase() + 'N';
}