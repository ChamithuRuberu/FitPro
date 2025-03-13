import { getSession, setSession } from '@/actions';
import { refreshToken, isTokenExpired } from '@/lib/jwt';

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  code: string;
  title: string;
  message: string;
  data: T;
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  skipTokenRefresh?: boolean;
}

type CustomHeaders = Record<string, string> & {
  'Content-Type': string;
  'Accept': string;
  'Authorization'?: string;
};

async function handleTokenRefresh() {
  const session = await getSession();
  if (!session.success || !session.data?.token) {
    throw new Error('No valid session');
  }

  const newToken = await refreshToken(session.data.token);
  if (!newToken) {
    throw new Error('Failed to refresh token');
  }

  await setSession({
    ...session.data,
    token: newToken
  });

  return newToken;
}

export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { requiresAuth = false, skipTokenRefresh = false, headers = {}, ...rest } = options;

  const requestHeaders: CustomHeaders = {
    ...headers as CustomHeaders,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Handle authentication
  if (requiresAuth) {
    const session = await getSession();
    if (!session.success || !session.data?.token) {
      throw new Error('Not authenticated');
    }

    // Check token expiration and refresh if needed
    if (!skipTokenRefresh && isTokenExpired(session.data.token)) {
      const newToken = await handleTokenRefresh();
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
    } else {
      requestHeaders['Authorization'] = `Bearer ${session.data.token}`;
    }
  }

  try {
    console.log(`🚀 Making ${options.method || 'GET'} request to:`, url);
    
    const response = await fetch(url, {
      headers: requestHeaders,
      mode: 'cors',
      credentials: 'include',
      cache: 'no-store',
      ...rest,
    });

    console.log('📥 Response status:', response.status);

    // Handle specific HTTP status codes
    if (response.status === 401) {
      if (!skipTokenRefresh && requiresAuth) {
        // Try one token refresh
        const newToken = await handleTokenRefresh();
        return apiRequest<T>(endpoint, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
          skipTokenRefresh: true, // Prevent infinite refresh loop
        });
      }
      throw new Error('Authentication failed');
    }

    const text = await response.text();
    console.log('📄 Raw response:', text);

    if (!text) {
      throw new Error('Empty response received');
    }

    const data = JSON.parse(text) as ApiResponse<T>;
    console.log('📦 Parsed response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    // Check API response code
    if (data.code !== "0000") {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

// Example usage:
// const loginResponse = await apiRequest<LoginResponse>('/user/login', {
//   method: 'POST',
//   body: JSON.stringify({ email, password, role_type })
// }); 