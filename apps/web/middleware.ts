import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['vi', 'en', 'ko'] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'en';
const COOKIE_NAME = 'companylab_locale';

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. Check Accept-Language header
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const primary = acceptLang.split(',')[0]?.split(';')[0]?.slice(0, 2).toLowerCase();
    if (primary && (LOCALES as readonly string[]).includes(primary)) {
      return primary as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check if pathname starts with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    // If accessing /[locale], redirect to /[locale]/overview
    for (const locale of LOCALES) {
      if (pathname === `/${locale}`) {
        return NextResponse.redirect(new URL(`/${locale}/overview${search}`, request.url));
      }
    }
    return NextResponse.next();
  }

  // If no locale in pathname, determine locale and redirect
  const locale = getPreferredLocale(request);
  const targetPath = pathname === '/' ? `/${locale}/overview` : `/${locale}${pathname}`;
  return NextResponse.redirect(new URL(`${targetPath}${search}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any static file with extension (e.g. .svg, .png, .jpg, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
};
