import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Vite / Node
const envUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';
const envAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

// Check if credentials are valid non-placeholder strings
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof envUrl === 'string' &&
    envUrl.startsWith('https://') &&
    !envUrl.includes('your-project-id') &&
    typeof envAnonKey === 'string' &&
    envAnonKey.length > 20 &&
    !envAnonKey.includes('...')
  );
};

// Fallback dummy URL/key so createClient doesn't throw at bundle evaluation if unconfigured
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-token-for-initialization';

// Polyfill no-op WebSocket for Node runtimes without native WebSocket (Node < 22)
if (typeof WebSocket === 'undefined' && typeof globalThis !== 'undefined') {
  try {
    (globalThis as any).WebSocket = class NoopWebSocket {
      constructor() {}
      addEventListener() {}
      removeEventListener() {}
      close() {}
      send() {}
    };
  } catch {}
}

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? envUrl : fallbackUrl,
  isSupabaseConfigured() ? envAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const start = performance.now();
  try {
    // Attempt a light query to verify database connectivity
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, connection is still valid but migration needed
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: `Connected to Supabase project (${latency}ms). Schema migration required.`,
          latencyMs: latency,
        };
      }
      return {
        success: false,
        message: `Database check returned error: ${error.message} (code ${error.code})`,
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL (${latency}ms). Database is live!`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network or configuration error connecting to Supabase: ${err.message || err}`,
    };
  }
};
