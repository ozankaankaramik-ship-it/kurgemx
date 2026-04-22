import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const HOME_PATHS = new Set(["/"]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth callback ve reset-password rotaları intl middleware'den muaf tutulur
  if (pathname.includes('/auth/callback') || pathname.endsWith('/reset-password')) {
    return NextResponse.next();
  }

  // Ana sayfa isteklerinde kullanıcı durumuna göre yönlendir
  if (HOME_PATHS.has(pathname)) {
    // Cookie'leri okumak için geçici bir response oluştur
    const tempResponse = NextResponse.next();

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
              tempResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const destination = user ? "/en" : "/en/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // next-intl routing (locale redirect/rewrite)
  const response = intlMiddleware(request);

  // Supabase oturum yenileme — güncel cookie'leri response'a yaz
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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Oturumu kontrol et (gerekirse token yeniler ve cookie'ye yazar)
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
