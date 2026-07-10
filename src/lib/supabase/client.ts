import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-supabase-url" || !supabaseUrl.startsWith("http")) {
    // Return a mock client when env vars are missing
    console.warn("Supabase URL/Key not configured. Using mock client.");
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Supabase belum dikonfigurasi" } }),
        signUp: () => Promise.resolve({ data: { session: null, user: null }, error: { message: "Supabase belum dikonfigurasi" } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
