"use server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
export async function setCookie(key: string, value: string, maxAge: number = 3600) {
    cookies().set({
        name: key,
        value: value,
        maxAge: maxAge, // Default: 1 hour
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
}

export async function getCookie(key: string): Promise<string | null> {
    return cookies().get(key)?.value || null;
}

export async function removeCookie(key: string) {
    cookies().delete(key);
}


export async function initializeRegistration(formData: {
    nic: string;
    mobile: string;
    email: string;
    role_type: string;
    trainer_id?: number;
}) {
    try {
        console.log("InitializeRegistration formData ->", formData);
        const response = await fetch(`${API_BASE_URL}/user/register-init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log("InitializeRegistration data ->", data);
        if (!response.ok) {
            return { success: false, message: data.message || 'Registration failed' };
        }

        setCookie("username", data.data.username);

        return {
            success: true,
            data: {
                username: data.data.username,
                mobile: data.data.mobile,
                user_role: data.data.user_role,
                trainer_id: data.data.trainer_id,
            },
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Registration failed' };
    }
}


export async function verifyOTP(verifyRequest: {
    username: string;
    otp: string;
}) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/register-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyRequest),
        });
        const result = await response.json();
        console.log("VerifyOTP result ->", result);
        if (!response.ok) {
            return { success: false, message: result.message || 'Verification failed' };
        }

        setCookie("trainer_id", result.data.trainer_id);
        return {
            success: true,
            message: result.message,
            data: {
                trainer_id: result.data.trainer_id,
            }
        };
    } catch (error) {
        console.error('Verification error:', error);
        return { success: false, message: 'Verification failed' };
    }
}

export async function trainerProfile(trainerProfileRequest: {
    name: string;
    city: string;
    password: string;
    weight: string;
    height: string;
    profile: string;
    trainerId: string;
    servicePeriod: string;
    role_type: string;
    username: string;
}) {
    try {
        console.log("Trainer profile request ->", trainerProfileRequest);
        const response = await fetch(`${API_BASE_URL}/user/gov-user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trainerProfileRequest),
        });
        const result = await response.json();

        if (!response.ok) {
            return { success: false, message: result.message || 'Trainer profile failed' };
        }

        // Stringify the result data before setting it as a cookie
        await setCookie("signup_data", JSON.stringify(result));
        console.log("Trainer profile result ->", result);

        return {
            success: true,
            message: result.message,
            data: result.data
        };

    } catch (error) {
        console.error('Trainer profile error:', error);
        return { success: false, message: 'Trainer profile failed' };
    }
}

export async function userLogin(loginRequest: {
    email: string;
    password: string;
}) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginRequest),
            credentials: 'include', // Important: include credentials for cookies
        });

        const result = await response.json();
        console.log("User login result ->", result);

        if (!response.ok) {
            return {
                success: false,
                message: result.message || `Login failed with status: ${response.status}`
            };
        }

        // Store session data in cookie if provided
        if (result.data?.token) {
            await setCookie("session", result.data.token);
            await setCookie("refresh_token", result.data.refresh_token);
            await setCookie("trainerId", result.data.user.gov_id?.toString() || '');
            await setCookie("fullName", result.data.user.full_name || '');
            await setCookie("city", result.data.user.city || '');
            await setCookie("status", result.data.user.status || '');
        }

        return {
            success: true,
            message: result.message || 'Login successful',
            data: result.data
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Login failed'
        };
    }
}

export async function completeUserProfile(formData: {
    username: string;
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
    trainerId: string;
}) {
    try {
        console.log("Complete user profile request ->", formData);

        const response = await fetch(`${API_BASE_URL}/user/client-register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                password: btoa(formData.password), // Example: Encode password before sending
            }),
        });

        const result = await response.json();
        console.log("Complete user profile result ->", result);

        if (!response.ok) {
            throw new Error(result.message || 'Profile completion failed');
        }

        return {
            success: true,
            message: result.message,
            data: result
        };
    } catch (error: any) {
        console.error('Profile completion error:', error.message);
        return { success: false, message: error.message || 'Profile completion failed' };
    }
}

export async function registerGym(gymForm: {
    gymName: string;
    location: string;
    email: string;
    phone: string;
    desc: string;
    monthlyFee: string;
    membership: string;
    password: string;
    roleType: string;
}) {
    try {
        console.log("Register gym request ->", gymForm);
        const response = await fetch(`${API_BASE_URL}/gym/register/gym`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gymForm),
        });

        console.log("Register gym response ->", response);
        const result = await response.json();
        console.log("Register gym result ->", result);

        if (!response.ok) {
            console.log("Register gym error ->", result);
            throw new Error(result.message || 'Gym registration failed');
        }

        return {
            success: true,
            message: result.message,
            data: result.data
        };
    } catch (error) {
        console.error('Gym registration error:', error);
        return { success: false, message: 'Gym registration failed' };
    }
}

export async function getTrainerClients() {
    try {
        const token = await getCookie('session');

        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const response = await fetch(`${API_BASE_URL}/trainer/get-clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to fetch clients'
            };
        }

        // Check if the response has the expected structure
        if (result.code === "0000" && result.data && result.data.clients) {
            return {
                success: true,
                data: result.data
            };
        }

        return {
            success: false,
            message: 'Invalid response format'
        };
    } catch (error) {
        console.error('Get trainer clients error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch clients'
        };
    }
}

export async function addClientToTrainer(clientData: {
    name: string;
    email: string;
    phone?: string;
    age?: string;
    weight?: string;
    height?: string;
    goal?: string;
    medicalHistory?: string;
    experience?: string;
}) {
    try {
        const token = await getCookie('session');

        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const response = await fetch(`${API_BASE_URL}/trainer/add-client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to add client'
            };
        }

        // Check if the response has the expected success code
        if (result.code === "0000" && result.data) {
            return {
                success: true,
                data: result.data
            };
        }

        return {
            success: false,
            message: result.message || 'Failed to add client'
        };
    } catch (error) {
        console.error('Add client error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add client'
        };
    }
}

export async function toggleClientStatus(clientId: string, status: 'ACTIVE' | 'INACTIVE') {
    try {
        const token = await getCookie('session');

        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const response = await fetch(`${API_BASE_URL}/trainer/update-client-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                clientId,
                status
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || `Failed to update client status`
            };
        }

        // Check if the response has the expected success code
        if (result.code === "0000") {
            return {
                success: true,
                data: result.data
            };
        }

        return {
            success: false,
            message: result.message || 'Failed to update client status'
        };
    } catch (error) {
        console.error('Toggle client status error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update client status'
        };
    }
}

export async function getTrainerList() {
    try {

        const response = await fetch(`${API_BASE_URL}/trainer/get-all-trainers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to fetch trainers'
            };
        }
        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Get trainer list error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch trainers'
        };
    }
}

export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    notes: string;
}

export interface WorkoutSession {
    type: string;
    day: string;
    startTime: string;
    duration: number;
    exercises: Exercise[];
    notes: string;
}

export interface WorkoutPlan {
    clientId: string;
    workoutName: string;
    startDate: string;
    endDate: string;
    workouts: WorkoutSession[];
}

export async function createWorkout(workoutPlan: WorkoutPlan) {
    try {
        const token = await getCookie('session');

        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const response = await fetch(`${API_BASE_URL}/workout/create-workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(workoutPlan)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to create workout plan'
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Create workout error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create workout plan'
        };
    }
}

export interface ExerciseDetails {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    equipment: string;
    targetMuscles: string;
    notes: string;
    restBetweenSets: string;
    tempo?: string;
    isDropSet?: boolean;
    isSuperSet?: boolean;
    superSetGroup?: string;
    progressionStrategy: string;
}

export interface WorkoutDay {
    day: string;
    focusArea: string;
    startTime: string;
    duration: number;
    intensity: 'LOW' | 'MEDIUM' | 'HIGH';
    warmupNotes?: string;
    cooldownNotes?: string;
    generalNotes?: string;
    exercises: ExerciseDetails[];
    isRestDay?: boolean;
}

export interface WorkoutWeek {
    weekNumber: number;
    weeklyGoal: string;
    notes: string;
    workoutDays: WorkoutDay[];
}

export interface AdvancedWorkoutProgram {
    clientId: string;
    programName: string;
    programDescription: string;
    startDate: string;
    endDate: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    goal: 'WEIGHT_LOSS' | 'STRENGTH_AND_HYPERTROPHY' | 'ENDURANCE' | 'FLEXIBILITY' | 'GENERAL_FITNESS';
    weeks: WorkoutWeek[];
}

export async function createAdvancedWorkout(workoutProgram: AdvancedWorkoutProgram) {
    try {
        const token = await getCookie('session');

        if (!token) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }

        const response = await fetch(`${API_BASE_URL}/workout/create-workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(workoutProgram)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to create advanced workout program'
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Create advanced workout error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create advanced workout program'
        };
    }
}   