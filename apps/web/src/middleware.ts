import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect ONLY /dashboard and /dashboard/*
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
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
  matcher: ['/dashboard', '/dashboard/:path*'],
};
