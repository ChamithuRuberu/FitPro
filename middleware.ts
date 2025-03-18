import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(req: NextRequest) {
  // Extract the token from cookies
  const token = req.cookies.get('session')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify the token
    const payload = await verifyToken(token);

    // Attach user data to the request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('user', JSON.stringify(payload));

    // Continue to the requested page
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Apply middleware to specific routes
export const config = {
  matcher: ['/dashboard/:path*'], // Protect all dashboard routes
};