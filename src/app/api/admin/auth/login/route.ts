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

    // 1. Check built-in Master Admin credentials first
    if (
      email.trim().toLowerCase() === "admin@autodrift.ph" &&
      password === "AdminAutoDrift2024!"
    ) {
      const cookieStore = cookies();
      cookieStore.set("autodrift_dev_admin", "authenticated", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      cookieStore.set("autodrift_admin_email", email.trim(), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { id: "admin-master", email: "admin@autodrift.ph" },
      });
    }

    // 2. Check Supabase Auth if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured =
      supabaseUrl && !supabaseUrl.includes("placeholder") && !supabaseUrl.includes("your-project-id");

    if (isSupabaseConfigured) {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!error && data?.user) {
        return NextResponse.json({
          success: true,
          user: { id: data.user.id, email: data.user.email },
        });
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }

    return NextResponse.json(
      { error: "Invalid email or password. Use admin@autodrift.ph / AdminAutoDrift2024!" },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
