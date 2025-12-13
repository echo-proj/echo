import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeConfig } from './config/routes';
import { AUTH_COOKIE_KEYS } from './lib/constants';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = routeConfig.protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isGuestOnlyRoute = routeConfig.guestOnlyRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isPublicRoute = routeConfig.publicRoutes.some(route =>
    pathname === route
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_KEYS.TOKEN)?.value;

  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = routeConfig.defaultUnauthenticatedRedirect;
    return NextResponse.redirect(url);
  }

  if (isGuestOnlyRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = routeConfig.defaultAuthenticatedRedirect;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}