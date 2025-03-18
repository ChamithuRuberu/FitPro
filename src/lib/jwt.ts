import * as jose from 'jose';

// Use SECRET_KEY from env for JWT signing
const JWT_SECRET = process.env.SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error('SECRET_KEY is not defined in environment variables');
}
const secret = new TextEncoder().encode(JWT_SECRET);

// Extend the jose JWT payload type
interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number;
  iss?: string;
  aud?: string;
}

const TOKEN_CONFIG = {
  expiresIn: '24h',
  algorithm: 'HS256' as const,
  issuer: 'fitpro-app',
  audience: 'fitpro-client',
} as const;

export async function createToken(userData: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>) {
  try {
    const token = await new jose.SignJWT({
      ...userData,
      tokenVersion: Date.now(),
    })
      .setProtectedHeader({ alg: TOKEN_CONFIG.algorithm })
      .setIssuedAt()
      .setIssuer(TOKEN_CONFIG.issuer)
      .setAudience(TOKEN_CONFIG.audience)
      .setExpirationTime(TOKEN_CONFIG.expiresIn)
      .sign(secret);

    return token;
  } catch (error) {
    console.error('JWT Creation Error:', error);
    throw new Error('Failed to create authentication token');
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [TOKEN_CONFIG.algorithm],
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
    });

    if (!isValidPayload(payload)) {
      console.error('Invalid token payload structure');
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      console.error('Token expired');
    } else if (error instanceof jose.errors.JWTClaimValidationFailed) {
      console.error('Token validation failed:', error.claim);
    } else {
      console.error('JWT Verification Error:', error);
    }
    return null;
  }
}

function isValidPayload(payload: unknown): payload is JWTPayload {
  if (!payload || typeof payload !== 'object') return false;
  
  const p = payload as Partial<JWTPayload>;
  return (
    typeof p.userId === 'string' &&
    typeof p.email === 'string' &&
    typeof p.role === 'string' &&
    typeof p.iss === 'string' &&
    typeof p.aud === 'string' &&
    p.iss === TOKEN_CONFIG.issuer &&
    p.aud === TOKEN_CONFIG.audience
  );
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded.exp) return true;
    
    // Add 30 seconds buffer for clock skew
    const bufferTime = 30;
    return (Date.now() / 1000) >= (decoded.exp - bufferTime);
  } catch {
    return true;
  }
}