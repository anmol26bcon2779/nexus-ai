import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'storage' | 'none';
  isValid: boolean;
  keyFormat: 'jwt' | 'publishable' | 'none';
  errorMessage?: string;
}

// Fallback dummy credentials to allow bundle initialization without throwing
const DUMMY_FALLBACK_URL = 'https://placeholder-project.supabase.co';
const DUMMY_FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-token-for-initialization';

// Read config from Vite environment variables or browser localStorage
export const getSupabaseConfig = (): SupabaseConfig => {
  // 1. Check environment variables
  let envUrl =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    '';

  let envKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    '';

  let source: SupabaseConfig['source'] = 'none';

  // Normalize strings
  envUrl = (envUrl || '').trim();
  envKey = (envKey || '').trim();

  if (envUrl && envKey && !envUrl.includes('your-project-id') && !envKey.includes('...')) {
    source = 'env';
  } else if (typeof window !== 'undefined' && window.localStorage) {
    // 2. Check browser localStorage runtime override
    const storageUrl = localStorage.getItem('nexus_supabase_url')?.trim() || '';
    const storageKey = localStorage.getItem('nexus_supabase_anon_key')?.trim() || '';
    if (storageUrl && storageKey) {
      envUrl = storageUrl;
      envKey = storageKey;
      source = 'storage';
    }
  }

  // Key format detection
  let keyFormat: SupabaseConfig['keyFormat'] = 'none';
  if (envKey.startsWith('ey')) {
    keyFormat = 'jwt';
  } else if (envKey.startsWith('sb_') || envKey.startsWith('sbp_')) {
    keyFormat = 'publishable';
  }

  // Validation
  let isValid = false;
  let errorMessage: string | undefined;

  if (!envUrl) {
    errorMessage = 'VITE_SUPABASE_URL is not set';
  } else if (!envUrl.startsWith('https://')) {
    errorMessage = 'VITE_SUPABASE_URL must start with https://';
  } else if (envUrl.includes('your-project-id')) {
    errorMessage = 'VITE_SUPABASE_URL contains placeholder value';
  } else if (!envKey) {
    errorMessage = 'VITE_SUPABASE_ANON_KEY is not set';
  } else if (envKey.length < 20 || envKey.includes('...')) {
    errorMessage = 'VITE_SUPABASE_ANON_KEY is invalid or truncated';
  } else {
    isValid = true;
  }

  return {
    url: envUrl,
    anonKey: envKey,
    source,
    isValid,
    keyFormat,
    errorMessage,
  };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isValid;
};

// Internal active client instance
let activeClient: SupabaseClient | null = null;
const listeners = new Set<(client: SupabaseClient) => void>();

function buildClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: typeof window !== 'undefined',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
}

function getActiveClient(): SupabaseClient {
  if (!activeClient) {
    const config = getSupabaseConfig();
    const url = config.isValid ? config.url : DUMMY_FALLBACK_URL;
    const key = config.isValid ? config.anonKey : DUMMY_FALLBACK_KEY;
    activeClient = buildClient(url, key);
  }
  return activeClient;
}

// Proxy wrapper so existing code importing `supabase` gets the active client dynamically
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getActiveClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Configure or update Supabase credentials at runtime
export const saveRuntimeSupabaseCredentials = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl.startsWith('https://')) {
    return { success: false, message: 'Supabase URL must start with https://' };
  }
  if (cleanKey.length < 20) {
    return { success: false, message: 'Anon / Publishable Key must be at least 20 characters' };
  }

  // Test live connection before saving
  const testClient = buildClient(cleanUrl, cleanKey);
  const start = performance.now();

  try {
    const { error } = await testClient.from('profiles').select('id', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // 42P01: relation does not exist yet (needs migration), but credentials are valid!
      if (!error.message.includes('relation "public.profiles" does not exist') && error.code !== '42P01') {
        return {
          success: false,
          message: `Supabase returned error: ${error.message} (code ${error.code})`,
          latencyMs: latency,
        };
      }
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_supabase_url', cleanUrl);
      localStorage.setItem('nexus_supabase_anon_key', cleanKey);
    }

    activeClient = testClient;
    listeners.forEach((listener) => listener(activeClient!));

    return {
      success: true,
      message: `Successfully connected to Supabase (${latency}ms)!`,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection test failed: ${err.message || 'Unable to reach Supabase project'}`,
    };
  }
};

// Clear runtime credentials
export const clearRuntimeSupabaseCredentials = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nexus_supabase_url');
    localStorage.removeItem('nexus_supabase_anon_key');
  }
  activeClient = null;
  const newClient = getActiveClient();
  listeners.forEach((listener) => listener(newClient));
};

// Register listener for credentials change
export const onSupabaseConfigChange = (callback: (client: SupabaseClient) => void): (() => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

// Diagnostics and Health Check
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  config: SupabaseConfig;
}> => {
  const config = getSupabaseConfig();
  if (!config.isValid) {
    return {
      success: false,
      message: config.errorMessage || 'Supabase credentials are not configured.',
      config,
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: `Connected to Supabase project (${latency}ms). Database schema migration required.`,
          latencyMs: latency,
          config,
        };
      }
      return {
        success: false,
        message: `Database check returned: ${error.message} (code ${error.code})`,
        latencyMs: latency,
        config,
      };
    }

    return {
      success: true,
      message: `Connected to Supabase PostgreSQL (${latency}ms). Database is live!`,
      latencyMs: latency,
      config,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error connecting to Supabase: ${err.message || err}`,
      config,
    };
  }
};
