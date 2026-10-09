import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerSupabaseClient();
      await supabase.auth.signOut();
    }

    const cookieStore = cookies();
    cookieStore.delete("autodrift_dev_admin");
    cookieStore.delete("autodrift_admin_email");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
