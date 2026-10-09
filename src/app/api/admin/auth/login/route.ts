import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured =
      supabaseUrl && !supabaseUrl.includes("placeholder") && !supabaseUrl.includes("your-project-id");

    if (isSupabaseConfigured) {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user.id, email: data.user.email },
      });
    }

    // Default admin login credentials when Supabase is not yet provisioned
    // Useful for instant local preview and evaluation before production deploy
    if (
      email.toLowerCase() === "admin@autodrift.ph" &&
      password === "AdminAutoDrift2024!"
    ) {
      const cookieStore = cookies();
      cookieStore.set("autodrift_dev_admin", "authenticated", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      cookieStore.set("autodrift_admin_email", email, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { id: "admin-master", email },
      });
    }

    return NextResponse.json(
      { error: "Invalid email or password. For demo mode use admin@autodrift.ph / AdminAutoDrift2024!" },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
