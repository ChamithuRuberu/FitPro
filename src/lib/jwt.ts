import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface UserPayload {
  data: {
    user: {
      full_name: string;
      mobile: string;
      nic: string;
      username: string;
      status: string;
    };
    trainer_obj?: {
      id: number;
      name: string;
      trainerId: string;
      servicePeriod: string;
      weight: string;
      height: string;
      profile: string;
    };
    token: string;
    refresh_token: string;
    roles?: {
      id: number;
      name: string;
      status: string;
      permissions: {
        id: number;
        name: string;
      }[];
    }[];
  };
  success: boolean;
}

export async function createToken(payload: UserPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 hours from now

  const token = await new SignJWT({
    ...payload,
    iat: now,
    exp,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function refreshToken(currentToken: string): Promise<string | null> {
  try {
    const userData = await verifyToken(currentToken);
    if (!userData) {
      return null;
    }

    // Create new token with updated expiration
    const newToken = await createToken(userData);

    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('Token expiration check failed:', error);
    return true;
  }
}

export function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    console.error('Failed to get role from token:', error);
    return null;
  }
} 