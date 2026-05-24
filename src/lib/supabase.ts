import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// On web, let supabase-js use its default (localStorage). On native, use
// AsyncStorage. The native module is required lazily inside the native branch
// so the web static export (which runs in Node) never loads it.
const storage =
  Platform.OS === 'web'
    ? undefined
    : require('@react-native-async-storage/async-storage').default;

// Safe at module scope: createClient does not touch window/localStorage here —
// storage is only read on getSession()/onAuthStateChange, which run inside
// AuthContext effects (never during web static export).
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
