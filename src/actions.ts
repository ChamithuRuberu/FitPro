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
    console.log('Verification response:', data);

    if (data.code !== "0000") {
      return { success: false, message: data.message || 'Verification failed' };
    }

    // Create initial session data
    const sessionData: UserPayload = {
      data: {
        user: {
          full_name: '',
          mobile: username,
          nic: data.data.user_id || '',
          username: username,
          status: 'PENDING'
        },
        token: '',
        refresh_token: ''
      },
      success: true
    };

    await setSession(sessionData);

    return { 
      success: true, 
      data: {
        user_status: data.data.user_status,
        user_id: data.data.user_id,
        trainer_id: data.data.trainer_id,
        username: username
      }
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'Verification failed' };
  }
}

export async function user_login(email: string, password: string) {
  try {
    console.log('Making login request to:', `${API_BASE_URL}/user/login`);
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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

    // Create session data from the API response, handling potential missing fields
    const sessionData: UserPayload = {
      data: {
        user: {
          email: data.data?.user?.email,
          city: data.data?.user?.city,
          status: data.data?.user?.status,
          mobile: data.data?.user?.mobile,
          full_name: data.data?.user?.full_name,
          gov_id: data.data?.user?.gov_id,
          nic: data.data?.user?.nic,
          username: data.data?.user?.username
        },
        roles: data.data?.roles || [],
        token: data.data?.token,
        refresh_token: data.data?.refresh_token
      },
      success: true
    };

    // Store session data
    console.log('Setting session with data:', sessionData);
    const sessionResult = await setSession(sessionData);
    
    if (!sessionResult.success) {
      console.error('Failed to set session:', sessionResult);
      return { 
        success: false, 
        message: 'Failed to create session',
        data: null 
      };
    }

    return { 
      success: true, 
      message: 'Login successful',
      data: data.data
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
    const response = await fetch(`${API_BASE_URL}/user/logout`, {
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

export interface UserProfileData {
  username: string;
  name: string;
  profile: string;
  full_name: string;
  birth_of_date: string;
  address_no: string;
  address_street: string;
  city: string;
  password: string;
  postalCode: string;
  role_type: string;
  servicePeriod: string;
  weight: string;
  height: string;
  injuries: string;
  trainerId?: string;
}

export async function completeUserProfile(profileData: UserProfileData) {
  try {
    console.log('Sending profile data:', profileData);
    const response = await fetch(`${API_BASE_URL}/user/app-user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: profileData.username.trim(),
        name: profileData.full_name.trim(),
        profile: profileData.profile || "default",
        full_name: profileData.full_name.trim(),
        birth_of_date: profileData.birth_of_date,
        address_no: profileData.address_no.trim(),
        address_street: profileData.address_street.trim(),
        city: profileData.city.trim(),
        password: profileData.password,
        postalCode: profileData.postalCode.trim(),
        role_type: "ROLE_USER",
        servicePeriod: profileData.servicePeriod || "0",
        weight: profileData.weight,
        height: profileData.height,
        injuries: profileData.injuries?.trim() || "None",
        trainerId: profileData.trainerId || "499763" // Default trainer ID if not provided
      }),
    });

    const data = await response.json();
    console.log('User profile completion response:', data);

    if (!response.ok) {
      console.error('HTTP Error:', response.status, data);
      return { success: false, message: data.message || `HTTP error: ${response.status}` };
    }

    if (data.code !== "0000") {
      console.error('API Error:', data);
      return { success: false, message: data.message || 'Profile completion failed' };
    }

    // Create session data from the API response
    const sessionData: UserPayload = {
      data: {
        user: {
          full_name: data.data.user.full_name || profileData.full_name,
          mobile: data.data.user.mobile || profileData.username,
          nic: data.data.user.nic || '',
          username: data.data.user.username || profileData.username,
          status: 'ACTIVE'
        },
        token: data.data.token,
        refresh_token: data.data.refresh_token,
        trainer_obj: data.data.trainer_obj || null
      },
      success: true
    };

    // Store session data
    console.log('Setting user profile session with data:', sessionData);
    const sessionResult = await setSession(sessionData);
    
    if (!sessionResult.success) {
      console.error('Failed to set session:', sessionResult);
      return { success: false, message: 'Failed to create user session' };
    }

    return { 
      success: true, 
      data: {
        ...data.data,
        user: {
          ...data.data.user,
          status: 'ACTIVE'
        }
      } 
    };
  } catch (error) {
    console.error('Profile completion error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Profile completion failed' };
  }
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
    trainerId: string;
}

export async function completeTrainerProfile(profileData: TrainerProfileData) {
  try {
    console.log('Completing trainer profile with data:', profileData);
    const response = await fetch(`${API_BASE_URL}/user/gov-user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        username: profileData.username
      }),
    });

    const data = await response.json();
    console.log('Trainer profile completion response:', data);

    if (data.code !== "0000") {
      return { success: false, message: data.message || 'Profile completion failed' };
    }

    // Update session with new trainer data from response
    const sessionData: UserPayload = {
      data: {
        user: {
          email: data.data?.user?.email,
          username: data.data?.user?.username,
          full_name: data.data?.user?.full_name,
          city: data.data?.user?.city,
          status: data.data?.user?.status,
          mobile: profileData.username,
          gov_id: data.data?.user?.gov_id
        },
        roles: [{
          id: 1,
          name: 'ROLE_TRAINER',
          status: 'ACTIVE',
          permissions: []
        }],
        token: data.data?.token,
        refresh_token: data.data?.refresh_token
      },
      success: true
    };

    console.log('Setting session with data:', sessionData);
    await setSession(sessionData);

    return { 
      success: true, 
      data: {
        ...data.data,
        user: {
          ...data.data?.user,
          role: 'ROLE_TRAINER'
        }
      } 
    };
  } catch (error) {
    console.error('Profile completion error:', error);
    return { success: false, message: 'Profile completion failed' };
  }
}

export async function checkTrainerAuth() {
  try {
    const session = await getSession();
    console.log('Checking trainer auth, session:', session);

    if (!session.success || !session.data) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check for trainer role in roles array
    const isTrainer = session.data.data.roles?.some(role => role.name === 'ROLE_TRAINER');
    if (!isTrainer) {
      console.log('Role mismatch: Not a trainer');
      return { success: false, message: 'Not authorized as trainer' };
    }

    // Safely access user data with optional chaining
    const userData = session.data.data.user;
    
    return { 
      success: true, 
      data: {
        ...session.data,
        userStatus: userData?.status || 'ACTIVE',
        fullName: userData?.full_name || userData?.username || 'Unknown',
        city: userData?.city || '',
        email: userData?.email || '',
        mobile: userData?.mobile || '',
      } 
    };
  } catch (error) {
    console.error('Trainer auth check error:', error);
    return { success: false, message: 'Authentication check failed' };
  }
}

export async function logoutTrainer() {
  return logoutUser();
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

export interface TrainerListResponse {
  trainers: {
    id: number;
    name: string;
    trainerId: string;
    servicePeriod: string;
    weight: string;
    height: string;
    profile: string;
  }[];
}

export async function getAllTrainers() {
  try {
    const response = await fetch(`${API_BASE_URL}/trainer/get-all-trainers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}), // Empty body for POST request
      cache: 'no-store' // Disable caching to always get fresh data
    });
    
    const data = await response.json();
    console.log('Trainers API response:', data);

    if (data.code !== "0000") {
      return { success: false, message: data.message || 'Failed to fetch trainers' };
    }

    if (!data.data?.trainers) {
      return { success: false, message: 'No trainers available' };
    }

    return { 
      success: true, 
      data: data.data.trainers 
    };
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch trainers' 
    };
  }
}