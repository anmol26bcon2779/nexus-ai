import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isSupabaseReady: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const isSupabaseReady = isSupabaseConfigured();

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || email.split('@')[0],
          avatarUrl: data.avatar_url,
          role: data.role || 'business_owner',
        });
      } else {
        // Fallback profile if profile row not synced yet
        setProfile({
          id: userId,
          email,
          fullName: email.split('@')[0],
          role: 'business_owner',
        });
      }
    } catch {
      setProfile({
        id: userId,
        email,
        fullName: email.split('@')[0],
        role: 'business_owner',
      });
    }
  };

  useEffect(() => {
    if (!isSupabaseReady) {
      // In demo mode without Supabase, initialize with demo founder profile
      setProfile({
        id: 'demo-user-1',
        email: 'founder@nexus-ai.biz',
        fullName: 'Swechha S.',
        role: 'Owner & Architect',
      });
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseReady]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      return { success: false, error: 'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication request failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseReady) {
      return { success: false, error: 'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        message: data.session ? 'Account created and signed in!' : 'Account created! Please check your email to confirm registration.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration request failed' };
    }
  };

  const signOut = async () => {
    if (isSupabaseReady) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile({
      id: 'demo-user-1',
      email: 'founder@nexus-ai.biz',
      fullName: 'Swechha S.',
      role: 'Owner & Architect',
    });
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseReady) {
      return { success: false, error: 'Supabase is not configured yet.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isSupabaseReady,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
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
