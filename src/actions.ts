"use server"
import { cookies } from "next/headers";
import { createToken, verifyToken, UserPayload } from "@/lib/jwt";

const API_BASE_URL = 'http://localhost:8080/api';

export async function getSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return { success: false, message: 'No session found' };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { success: false, message: 'Invalid session' };
    }

    return { success: true, data: payload };
  } catch (error) {
    console.error('Session error:', error);
    return { success: false, message: 'Session error' };
  }
}

export async function setSession(payload: UserPayload) {
  try {
    const token = await createToken(payload);
    cookies().set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    return { success: true };
  } catch (error) {
    console.error('Set session error:', error);
    return { success: false, message: 'Failed to set session' };
  }
}

export async function destroySession() {
  try {
    cookies().delete('session');
    return { success: true };
  } catch (error) {
    console.error('Destroy session error:', error);
    return { success: false, message: 'Failed to destroy session' };
  }
}

export async function initializeRegistration(formData: {
  nic: string;
  mobile: string;
  email: string;
  role_type: string;
  trainer_id?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register-init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Registration failed' };
    }

    return { 
      success: true, 
      data: {
        app_user_id: data.data.app_user_id,
        mobile: data.data.mobile,
        user_role: data.data.user_role
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function verifyOTP(username: string, otp: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Verification failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'Verification failed' };
  }
}

export async function user_login(email: string, password: string, role_type: string) {
  try {
    console.log('Making login request to:', `${API_BASE_URL}/user/login`);
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role_type }),
    });

    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);

    if (data.code !== "0000") {
      return { 
        success: false, 
        message: data.message || 'Login failed',
        data: null 
      };
    }

    if (!data.data?.user) {
      return { 
        success: false, 
        message: 'Invalid response from server',
        data: null 
      };
    }

    const userData = data.data.user;
    const token = data.data.token;

 
    return { 
      success: true, 
      message: data.message || 'Login successful',
      data: {
        ...userData,
        token: token,
        refreshToken: data.data.refresh_token
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Login failed',
      data: null 
    };
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, message: 'Logout failed' };
    }

    // Destroy session
    await destroySession();

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed' };
  }
}

export async function completeTrainerProfile(profileData: any) {
  try {
    const session = await getSession();
    if (!session.success || !session.data?.token) {
      return { success: false, message: 'Unauthorized' };
    }

    const response = await fetch(`${API_BASE_URL}/trainers/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Profile completion failed' };
    }

    // Update session with new trainer data
    await setSession({
      ...session.data,
      trainerId: data.trainerId,
      city: data.city,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Profile completion error:', error);
    return { success: false, message: 'Profile completion failed' };
  }
}

export async function checkTrainerAuth() {
  try {
    const session = await getSession();
    if (!session.success || !session.data) {
      return { success: false, message: 'Unauthorized' };
    }

    if (session.data.role !== 'trainer') {
      return { success: false, message: 'Not a trainer' };
    }

    return { success: true, data: session.data };
  } catch (error) {
    console.error('Trainer auth check error:', error);
    return { success: false, message: 'Authentication check failed' };
  }
}

export async function logoutTrainer() {
  return logoutUser();
}

export interface TrainerProfileData {
  username: string;
  name: string;
  city: string;
  password: string;
  role_type: string;
  servicePeriod: string;
  weight: string;
  height: string;
  profile: string;
}

export async function getTrainerClients() {
  const session = await getSession();
  
  if (!session.success || !session.data?.token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/trainer/clients`, {
      headers: {
        'Authorization': `Bearer ${session.data.token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code === "0000") {
      return { 
        success: true, 
        data: data.data as ClientData[] 
      };
    }

    return { success: false, error: data.message };
  } catch (error) {
    console.error('Error fetching trainer clients:', error);
    return { success: false, error: 'Failed to fetch clients' };
  }
}

export async function getRecommendedSupplements() {
  const session = await getSession();
  
  if (!session.success || !session.data?.token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/trainer/supplements/recommended`, {
      headers: {
        'Authorization': `Bearer ${session.data.token}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code === "0000") {
      return { 
        success: true, 
        data: data.data as NutritionItem[] 
      };
    }

    return { success: false, error: data.message };
  } catch (error) {
    console.error('Error fetching recommended supplements:', error);
    return { success: false, error: 'Failed to fetch supplements' };
  }
}

export interface TrainerStats {
    monthlyRevenue: number;
    activeClients: number;
    completedSessions: number;
    upcomingSessions: number;
    averageRating: number;
}

export interface ClientData {
    id: string;
    name: string;
    program: string;
    progress: number;
    attendance: number;
    nextSession: string;
    subscriptionStatus: string;
}

export interface NutritionItem {
    id: string;
    name: string;
    category: string;
    subCategory: string;
    description: string;
    benefits: string[];
    image: string;
    tags: string[];
    nutritionalInfo: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    servingSize: string;
    price: {
        amount: number;
        currency: string;
    };
}