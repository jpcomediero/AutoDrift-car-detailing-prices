import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth api routes to pass through freely
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth/login") ||
    pathname.startsWith("/api/admin/auth/logout")
  ) {
    return NextResponse.next();
  }

  // Only guard /admin and /api/admin/*
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Check for authentication cookies
  // 1. Development / demo admin cookie
  const devAdminCookie = request.cookies.get("autodrift_dev_admin")?.value;
  const isDevAuth = devAdminCookie === "authenticated";

  // 2. Supabase auth token cookies (e.g. sb-<project>-auth-token or sb-access-token)
  let isSupabaseAuth = false;
  const allCookies = request.cookies.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith("sb-") && c.name.endsWith("-auth-token") && c.value) {
      isSupabaseAuth = true;
      break;
    }
    if (c.name === "sb-access-token" && c.value) {
      isSupabaseAuth = true;
      break;
    }
  }

  const isAuth = isDevAuth || isSupabaseAuth;

  if (!isAuth) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
