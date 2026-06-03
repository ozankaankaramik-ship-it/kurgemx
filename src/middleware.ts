import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function getPreferredLocale(request: NextRequest): "tr" | "en" {
  const al = request.headers.get("accept-language") ?? "";
  return al.toLowerCase().includes("tr") ? "tr" : "en";
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth callback, reset-password ve share: intl middleware'den muaf
  if (
    pathname.includes("/auth/callback") ||
    pathname.endsWith("/reset-password") ||
    pathname.startsWith("/share/")
  ) {
    return NextResponse.next();
  }

  // Root (/) → tarayıcı diline göre yönlendir + auth kontrolü
  if (pathname === "/") {
    const locale = getPreferredLocale(request);
    const refreshedCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              refreshedCookies.push({ name, value, options: options as Record<string, unknown> });
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Giriş yapmış → /projeler (locale ile)
    // Giriş yapmamış → landing page (locale ile) — login'e yönlendirme YOK
    const dest = user ? `/${locale}/projeler` : `/${locale}`;
    const response = NextResponse.redirect(new URL(dest, request.url));
    refreshedCookies.forEach(({ name, value, options }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.cookies.set(name, value, options as any);
    });
    return response;
  }

  // next-intl routing (locale tespiti / rewrite)
  const response = intlMiddleware(request);

  // Supabase oturum yenileme — güncel cookie'leri response'a yaz
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
