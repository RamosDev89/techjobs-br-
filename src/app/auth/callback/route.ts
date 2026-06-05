import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  const redirectCookie = request.cookies.get("auth_redirect")?.value;
  const next = redirectCookie ? decodeURIComponent(redirectCookie) : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const redirectResponse = NextResponse.redirect(`${origin}${next}`);
  redirectResponse.cookies.set("auth_redirect", "", { maxAge: 0, path: "/" });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  return redirectResponse;
}
