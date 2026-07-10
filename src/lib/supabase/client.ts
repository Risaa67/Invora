import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-supabase-url" || !supabaseUrl.startsWith("http")) {
    // Return a mock client during build or when env vars are missing
    return {
      from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [], error: null }), insert: () => Promise.resolve({ data: null, error: null }), update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }), delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }), single: () => Promise.resolve({ data: null, error: null }) }) }),
      auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }), signOut: () => Promise.resolve({ error: null }) },
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
