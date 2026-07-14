import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function nextWithPathname(request, pathname) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function hasSupabaseAuthCookie(request) {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes('auth-token') ||
        (cookie.name.startsWith('sb-') && cookie.name.includes('auth'))
    );
}

export async function updateSession(request) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';
  const isAccountRoute = pathname.startsWith('/account');

  let supabaseResponse = nextWithPathname(request, pathname);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isAdminRoute && !isAdminLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('error', 'config');
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  // Public pages with no session cookie — skip auth network round-trip
  if (!hasSupabaseAuthCookie(request) && !isAdminRoute && !isAccountRoute) {
    return supabaseResponse;
  }

  // Gated routes with no cookie — redirect without calling Supabase
  if (!hasSupabaseAuthCookie(request)) {
    if (isAdminRoute && !isAdminLogin) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAccountRoute) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      homeUrl.searchParams.set('login', '1');
      return NextResponse.redirect(homeUrl);
    }
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = nextWithPathname(request, pathname);
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isAdminLogin && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAccountRoute && !user) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.searchParams.set('login', '1');
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
