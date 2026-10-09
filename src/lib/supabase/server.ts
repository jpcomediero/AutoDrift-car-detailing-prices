import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              apikey: supabaseAnonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: { message: data.error_description || data.msg || data.message || "Login failed" } };
          }

          if (data.access_token) {
            cookieStore.set("sb-access-token", data.access_token, {
              httpOnly: true,
              path: "/",
              maxAge: data.expires_in || 60 * 60 * 24 * 7,
            });
          }

          return { data: { user: data.user, session: data }, error: null };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Network error";
          return { data: null, error: { message: msg } };
        }
      },

      async getUser() {
        const token = cookieStore.get("sb-access-token")?.value;
        if (!token) {
          return { data: { user: null }, error: null };
        }

        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            return { data: { user: null }, error: null };
          }

          const user = await res.json();
          return { data: { user }, error: null };
        } catch {
          return { data: { user: null }, error: null };
        }
      },

      async signOut() {
        cookieStore.delete("sb-access-token");
        return { error: null };
      },
    },
  };
}
