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

    // Determine role and next step
    const userRole = data.data.user_role?.[0]?.name || 'ROLE_USER';
    const nextPath = userRole === 'ROLE_TRAINER' ? '/trainer-profile' : '/user-profile';

    // Create minimal session data for initial signup
    const sessionData: UserPayload = {
      username: username,
      email: username, // Using username as email since it's required
      role: userRole,
      token: '',  // Will be set after profile completion
      refreshToken: '',
      userId: data.data.app_user_id || '',
      fullName: '',  // Will be set during profile completion
      city: '',      // Will be set during profile completion
      status: 'PENDING', // Set as pending until profile is completed
      mobile: data.data.mobile || username
    };

    // Store session data
    console.log('Setting signup session with data:', sessionData);
    await setSession(sessionData);

    return { 
      success: true, 
      data: {
        user_status: 'PENDING',
        user_id: data.data.app_user_id,
        username: username,
        role: userRole,
        nextPath: nextPath, // Include the next path in response
        requiresProfile: true // Flag to indicate profile completion is needed
      }
    };
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

    // Extract all necessary data
    const userData = data.data.user;
    const token = data.data.token;
    const roles = data.data.roles;
    const primaryRole = roles[0];

    // Create minimal session data with only necessary fields
    const sessionData: UserPayload = {
      username: userData.email,
      email: userData.email,
      role: primaryRole.name,
      token: token,
      refreshToken: data.data.refresh_token,
      userId: userData.gov_id?.toString() || '',
      fullName: userData.full_name || '',
      city: userData.city || '',
      status: userData.status || 'ACTIVE',
      mobile: userData.mobile || ''
    };

    // Set the session
    console.log('Setting login session with data:', sessionData);
    await setSession(sessionData);

    return { 
      success: true, 
      message: data.message || 'Login successful',
      data: sessionData
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
}

export async function completeUserProfile(profileData: UserProfileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/app-user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    console.log('User profile completion response:', data);

    if (data.code !== "0000") {
      return { success: false, message: data.message || 'Profile completion failed' };
    }

    // Create complete session data
    const sessionData: UserPayload = {
      username: profileData.username,
      email: profileData.username,
      role: 'ROLE_USER',
      token: data.data.token || '',
      refreshToken: data.data.refresh_token || '',
      userId: data.data.user_id || '',
      fullName: profileData.full_name,
      city: profileData.city,
      status: 'ACTIVE',
      mobile: profileData.username,
      weight: profileData.weight,
      height: profileData.height
    };

    // Store session data
    console.log('Setting user profile session with data:', sessionData);
    await setSession(sessionData);

    return { 
      success: true, 
      data: {
        ...data.data,
        user: {
          ...data.data,
          role: 'ROLE_USER',
          status: 'ACTIVE'
        }
      } 
    };
  } catch (error) {
    console.error('Profile completion error:', error);
    return { success: false, message: 'Profile completion failed' };
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
      username: data.data.user.email,
      email: data.data.user.email,
      role: 'ROLE_TRAINER',
      token: data.data.token,
      refreshToken: data.data.refresh_token,
      userId: data.data.user.user_id.toString(),
      fullName: data.data.user.full_name,
      city: data.data.user.city,
      status: data.data.user.status,
      mobile: profileData.username, // Using the original username as mobile since it's required
      trainerId: data.data.user.user_id.toString()
    };

    console.log('Setting session with data:', sessionData);
    await setSession(sessionData);

    return { 
      success: true, 
      data: {
        ...data.data,
        user: {
          ...data.data.user,
          role: 'ROLE_TRAINER',
          trainerId: data.data.user.user_id.toString()
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

    // Check for exact role match
    if (session.data.role !== 'ROLE_TRAINER') {
      console.log('Role mismatch:', session.data.role);
      return { success: false, message: 'Not authorized as trainer' };
    }

    return { 
      success: true, 
      data: {
        ...session.data,
        userStatus: session.data.status || 'ACTIVE',
        fullName: session.data.fullName || session.data.username,
        city: session.data.city || '',
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