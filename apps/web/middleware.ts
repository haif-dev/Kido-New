import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@app/i18n';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return;
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`,
  );
  if (pathnameHasLocale) return;

  // Detect preferred locale from cookie or Accept-Language
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value as Locale | undefined;
  const headerLang = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
  const guess: Locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)
      ? cookieLocale
      : headerLang === 'ar'
        ? 'ar'
        : DEFAULT_LOCALE;

  req.nextUrl.pathname = `/${guess}${pathname}`;
  return NextResponse.redirect(req.nextUrl);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
