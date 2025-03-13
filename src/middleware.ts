import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes patterns
const protectedRoutes = {
  trainer: ['/trainer', '/trainer-dashboard'],
  client: ['/client', '/client-dashboard'],
  nutritionist: ['/nutritionist', '/nutritionist-dashboard'],
  admin: ['/admin', '/admin-dashboard']
};

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/login',
  '/register-init',
  '/verify',
  '/forgot-password',
  '/reset-password'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session token
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return redirectToLogin(request);
  }

  try {
    // Verify token and get user data
    const userData = await verifyToken(sessionToken);
    
    if (!userData) {
      return redirectToLogin(request);
    }

    // Check if token is expired
    const tokenData = JSON.parse(atob(sessionToken.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    
    if (Date.now() >= expirationTime) {
      return redirectToLogin(request);
    }

    // Check role-based access
    const userRole = userData.role.toLowerCase();
    const isAccessingRoleRoute = Object.entries(protectedRoutes).some(
      ([role, routes]) => routes.some(route => pathname.startsWith(route))
    );

    if (isAccessingRoleRoute) {
      const hasAccess = protectedRoutes[userRole as keyof typeof protectedRoutes]?.some(
        route => pathname.startsWith(route)
      );

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        return redirectToDashboard(request, userRole);
      }
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userData.userId);
    requestHeaders.set('x-user-role', userData.role);
    requestHeaders.set('x-user-email', userData.email);

    // Continue with modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

function redirectToDashboard(request: NextRequest, role: string) {
  const url = request.nextUrl.clone();
  switch (role) {
    case 'trainer':
      url.pathname = '/trainer-dashboard';
      break;
    case 'client':
      url.pathname = '/client-dashboard';
      break;
    case 'nutritionist':
      url.pathname = '/nutritionist-dashboard';
      break;
    case 'admin':
      url.pathname = '/admin-dashboard';
      break;
    default:
      url.pathname = '/login';
  }
  return NextResponse.redirect(url);
}

// Configure which routes should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 