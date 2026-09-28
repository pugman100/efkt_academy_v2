import { NextResponse, type NextRequest } from 'next/server';

// Cheap gate: bounce requests without a session cookie to /login.
// Real session validation happens server-side in layouts and actions.
const PUBLIC = ['/login', '/invite', '/reset', '/api/cron', '/assets', '/_next', '/favicon'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get('efkt_session')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|assets/).*)'] };
