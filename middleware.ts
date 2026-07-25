import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, hasValidSession } from '@/utils/adminAuth';

// Guards the admin task tracker: the /admin pages and the /api/admin/* routes.
// The login page and login endpoint are exempt so users can authenticate.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: the login page and the login/logout endpoints.
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (await hasValidSession(cookie)) {
    return NextResponse.next();
  }

  // Unauthenticated API calls get a 401; page requests are sent to login.
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
