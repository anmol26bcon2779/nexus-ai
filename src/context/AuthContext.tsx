import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  onSupabaseConfigChange,
  saveRuntimeSupabaseCredentials,
  clearRuntimeSupabaseCredentials,
  getSupabaseConfig,
} from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

export type AuthModalMode = 'signin' | 'signup' | 'reset' | 'update-password';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isSupabaseReady: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ success: boolean; error?: string; message?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  saveRuntimeCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  clearRuntimeCredentials: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  const [isSupabaseReady, setIsSupabaseReady] = useState<boolean>(isSupabaseConfigured());

  // Fetch or safely sync profile
  const fetchProfile = useCallback(async (userId: string, email: string, metaName?: string) => {
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
          fullName: data.full_name || metaName || email.split('@')[0],
          avatarUrl: data.avatar_url,
          role: data.role || 'business_owner',
        });
      } else {
        const fallbackName = metaName || email.split('@')[0];
        setProfile({
          id: userId,
          email,
          fullName: fallbackName,
          role: 'business_owner',
        });

        // Attempt safe upsert if profiles table is ready
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email,
            full_name: fallbackName,
            role: 'business_owner',
          });
        } catch {
          // Table might not be migrated yet; fallback profile remains active
        }
      }
    } catch {
      setProfile({
        id: userId,
        email,
        fullName: metaName || email.split('@')[0],
        role: 'business_owner',
      });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseReady(false);
      setSession(null);
      setUser(null);
      setProfile({
        id: 'demo-user-1',
        email: 'founder@nexus-ai.biz',
        fullName: 'Swechha S.',
        role: 'Owner & Architect',
      });
      setLoading(false);
      return;
    }

    setIsSupabaseReady(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        const metaName = data.session.user.user_metadata?.full_name;
        await fetchProfile(data.session.user.id, data.session.user.email || '', metaName);
      } else {
        setSession(null);
        setUser(null);
        setProfile({
          id: 'demo-user-1',
          email: 'founder@nexus-ai.biz',
          fullName: 'Swechha S.',
          role: 'Owner & Architect',
        });
      }
    } catch (err) {
      console.warn('[AuthContext] Session retrieval error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Initialize and listen to Auth events
  useEffect(() => {
    refreshSession();

    // Check for password recovery hash in URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || hash.includes('access_token=')) {
        setIsAuthModalOpen(true);
        setAuthModalMode('update-password');
      }
    }

    // Subscribe to Supabase Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsAuthModalOpen(true);
        setAuthModalMode('update-password');
      }

      if (newSession?.user) {
        const metaName = newSession.user.user_metadata?.full_name;
        await fetchProfile(newSession.user.id, newSession.user.email || '', metaName);
      } else {
        setProfile({
          id: 'demo-user-1',
          email: 'founder@nexus-ai.biz',
          fullName: 'Swechha S.',
          role: 'Owner & Architect',
        });
      }
      setLoading(false);
    });

    // Listen to runtime credential changes
    const unbindConfigChange = onSupabaseConfigChange(async () => {
      const configured = isSupabaseConfigured();
      setIsSupabaseReady(configured);
      await refreshSession();
    });

    return () => {
      subscription.unsubscribe();
      unbindConfigChange();
    };
  }, [refreshSession, fetchProfile]);

  // Sign In with Email & Password
  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured. Connect your Supabase project in Settings or the setup modal.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Incorrect email or password. Please verify your credentials.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Your email address has not been verified yet. Please check your inbox for the confirmation email.',
          };
        }
        return { success: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      const metaName = data.user.user_metadata?.full_name;
      await fetchProfile(data.user.id, data.user.email || '', metaName);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication request failed' };
    }
  };

  // Sign Up with Name, Email & Password
  const signUp = async (email: string, password: string, fullName: string) => {
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase credentials are not configured. Connect your Supabase project to enable account creation.',
      };
    }

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please provide your full name (at least 2 characters).' };
    }

    if (!cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return {
            success: false,
            error: 'An account with this email address already exists. Please sign in or use "Forgot Password".',
          };
        }
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: `Account created! We've sent a verification email to ${cleanEmail}. Please click the confirmation link in your inbox to complete registration.`,
        };
      }

      // Direct sign in (Email confirmation disabled in Supabase dashboard)
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, cleanEmail, cleanName);
        return {
          success: true,
          requiresEmailConfirmation: false,
          message: `Welcome to Nexus AI, ${cleanName}! Your account is active.`,
        };
      }

      return {
        success: true,
        message: 'Account registered successfully. Please check your email to verify your account.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration request failed.' };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthContext] Sign out error:', err);
      }
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

  // Password Reset Email
  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim();
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase credentials are not configured.' };
    }

    if (!cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: `Password reset link sent to ${cleanEmail}. Check your inbox (and spam folder) to set a new password.`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  };

  // Update Password (after recovery link is clicked)
  const updatePassword = async (newPassword: string) => {
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear hash from URL
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      return {
        success: true,
        message: 'Your password has been successfully updated! You are now securely signed in.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed.' };
    }
  };

  // Resend Email Confirmation
  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Verification email resent! Check your inbox.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Save runtime credentials
  const saveRuntimeCredentials = async (url: string, key: string) => {
    const res = await saveRuntimeSupabaseCredentials(url, key);
    if (res.success) {
      setIsSupabaseReady(true);
      await refreshSession();
    }
    return res;
  };

  // Clear runtime credentials
  const clearRuntimeCredentials = () => {
    clearRuntimeSupabaseCredentials();
    setIsSupabaseReady(false);
    setSession(null);
    setUser(null);
    setProfile({
      id: 'demo-user-1',
      email: 'founder@nexus-ai.biz',
      fullName: 'Swechha S.',
      role: 'Owner & Architect',
    });
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
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        resendConfirmationEmail,
        saveRuntimeCredentials,
        clearRuntimeCredentials,
        refreshSession,
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
