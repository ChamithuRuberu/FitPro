'use server';
import { cookies } from 'next/headers';
import { verifyToken, isTokenExpired } from './jwt';

export async function getSession() {
  const token = cookies().get('session')?.value;
  
  if (!token || isTokenExpired(token)) {
    return { isAuthenticated: false, user: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  };
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete('session');
  cookieStore.delete('user_role');
  cookieStore.delete('user_data');
}

export async function getDashboardPath(role: string): Promise<string> {
  const dashboardPaths: Record<string, string> = {
    'ROLE_TRAINER': '/dashboard/trainer-admin',
    'ROLE_GYM': '/dashboard/gym-admin',
    'ROLE_SUPER_ADMIN': '/dashboard/super-admin',
    'ROLE_USER': '/dashboard/client-dashboard',
  };
  
  return dashboardPaths[role] || '/dashboard/client-dashboard';
} 