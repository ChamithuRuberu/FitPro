import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface UserPayload {
  userId: string;
  email: string;
  fullName?: string;
  role: string;
  trainerId?: string;
  city?: string;
  userStatus?: string;
  token?: string;
  mobile?: string;
  govId?: string | null;
}

export async function createToken(payload: Record<string, any>): Promise<string> {
  const token = await new SignJWT(payload)
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
    return null;
  }
}

export async function decodeToken(token: string): Promise<UserPayload | null> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
} 