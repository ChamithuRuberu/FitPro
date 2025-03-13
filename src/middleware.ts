import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes patterns
const protectedRoutes = {
  trainer: ['/trainer', '/trainer-dashboard', '/dashboard/trainer-admin'],
  client: ['/client', '/client-dashboard', '/dashboard/client-dashboard'],
  nutritionist: ['/nutritionist', '/nutritionist-dashboard'],
  admin: ['/admin', '/admin-dashboard']
};

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/login',
  '/register-init',
  '/verify',
  '/user-profile',
  '/trainer-profile'
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

    // Map role to route group
    const roleToGroup: { [key: string]: keyof typeof protectedRoutes } = {
      'ROLE_TRAINER': 'trainer',
      'ROLE_USER': 'client',
      'ROLE_NUTRITIONIST': 'nutritionist',
      'ROLE_ADMIN': 'admin'
    };

    const userRoleGroup = roleToGroup[userData.role];
    
    // Check if user is accessing a protected route
    const isAccessingProtectedRoute = Object.values(protectedRoutes).flat().some(
      (route: string) => pathname.startsWith(route)
    );

    if (isAccessingProtectedRoute && userRoleGroup) {
      // Check if user has access to the route
      const hasAccess = protectedRoutes[userRoleGroup]?.some(
        (route: string) => pathname.startsWith(route)
      );

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        const dashboardPath = userRoleGroup === 'client' 
          ? '/dashboard/client-dashboard'
          : userRoleGroup === 'trainer'
          ? '/dashboard/trainer-admin'
          : '/';
        
        return NextResponse.redirect(new URL(dashboardPath, request.url));
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
  return NextResponse.redirect(new URL('/login', request.url));
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