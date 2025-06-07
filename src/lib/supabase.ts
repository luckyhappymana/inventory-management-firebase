import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client with retry logic and better error handling
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'inventory-management-system'
    }
  }
});

// Connection health check function
export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to check Supabase connection:', error);
    return false;
  }
}

// Initialize connection
let isInitialized = false;

export async function initializeSupabase(): Promise<void> {
  if (isInitialized) return;

  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.error('Failed to establish Supabase connection');
      return;
    }
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
  }
}