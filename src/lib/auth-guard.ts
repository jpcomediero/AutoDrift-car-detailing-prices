import { cookies } from "next/headers";
import { createServerSupabaseClient } from "./supabase/server";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
}

/**
 * Server-side helper to ensure the current caller is an authenticated admin
 */
export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const cookieStore = cookies();

  // 1. Check Supabase Auth User
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email) {
      return {
        id: user.id,
        email: user.email,
      };
    }
  } catch {
    // If Supabase is unconfigured, check dev admin cookie
  }

  // 2. Fallback development admin cookie if Supabase credentials are not filled yet
  const devAdmin = cookieStore.get("autodrift_dev_admin")?.value;
  if (devAdmin === "authenticated") {
    return {
      id: "admin-master",
      email: cookieStore.get("autodrift_admin_email")?.value || "admin@autodrift.ph",
    };
  }

  return null;
}
