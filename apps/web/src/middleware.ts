import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PROTECTED_ROUTES = [
  '/dashboard',
  '/telemetry',
  '/intelligence',
  '/inventory',
  '/diagnostics',
  '/reports',
  '/settings',
  '/orders',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    const token = request.cookies.get('nexpod_auth_token')?.value;
    const role = request.cookies.get('nexpod_user_role')?.value;

    if (!token || role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/telemetry',
    '/telemetry/:path*',
    '/intelligence',
    '/intelligence/:path*',
    '/inventory',
    '/inventory/:path*',
    '/diagnostics',
    '/diagnostics/:path*',
    '/reports',
    '/reports/:path*',
    '/settings',
    '/settings/:path*',
    '/orders',
    '/orders/:path*',
  ],
};
