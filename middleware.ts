import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, isTokenExpired } from '@/lib/jwt';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/dashboard/trainer-admin': ['ROLE_TRAINER'],
  '/dashboard/gym-admin': ['ROLE_GYM'],
  '/dashboard/super-admin': ['ROLE_SUPER_ADMIN'],
  '/dashboard/client-dashboard': ['ROLE_USER'],
};

// Define auth routes that authenticated users shouldn't access
const authRoutes = ['/login', '/register-init', '/verify', '/user-profile', '/trainer-profile'];

// Define public routes that don't need authentication
const publicRoutes = ['/', '/about', '/contact'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('session')?.value;

  // Check if user is authenticated
  const isAuthenticated = token && !isTokenExpired(token);
  
  // If authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && authRoutes.includes(pathname)) {
    const payload = await verifyToken(token);
    if (payload) {
      const dashboardPaths: Record<string, string> = {
        'ROLE_TRAINER': '/dashboard/trainer-admin',
        'ROLE_GYM': '/dashboard/gym-admin',
        'ROLE_SUPER_ADMIN': '/dashboard/super-admin',
        'ROLE_USER': '/dashboard/client-dashboard',
      };
      
      const response = NextResponse.redirect(new URL(dashboardPaths[payload.role], req.url));
      // Prevent caching of the response
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !authRoutes.includes(pathname)) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('session');
    return response;
  }

  try {
    // For protected routes, verify token and check role-based access
    if (isAuthenticated) {
      const payload = await verifyToken(token);
      if (!payload) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('session');
        return response;
      }

      // Check role-based access for protected routes
      const userRole = payload.role;
      const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
        pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        const allowedRoles = Object.entries(protectedRoutes).find(([route]) => 
          pathname.startsWith(route)
        )?.[1] || [];

        if (!allowedRoles.includes(userRole)) {
          const defaultRoutes: Record<string, string> = {
            'ROLE_TRAINER': '/dashboard/trainer-admin',
            'ROLE_GYM': '/dashboard/gym-admin',
            'ROLE_SUPER_ADMIN': '/dashboard/super-admin',
            'ROLE_USER': '/dashboard/client-dashboard',
          };

          return NextResponse.redirect(new URL(defaultRoutes[userRole], req.url));
        }
      }

      // Add user info to request headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('user', JSON.stringify(payload));

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Prevent caching for authenticated routes
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('session');
    return response;
  }
}

// Update config to protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};