"use server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    console.log("url ->", url);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        console.log("response ->", response);
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
        setCookie("trainerId", result.data.user.trainer_id);
        setCookie("fullName", result.data.user.full_name);
        setCookie("city", result.data.user.city);
        setCookie("status", result.data.user.status);
        setCookie("role_type", "ROLE_TRAINER");
        setCookie("session", result.data.token);
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
        console.log("User login request ->", loginRequest);
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
    chest?: string;
    waist?: string;
    neck?: string;
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
                // password: btoa(formData.password), // Example: Encode password before sending
            }),
        });

        const result = await response.json();
        console.log("Complete user profile result ->", result);

        if (!response.ok) {
            throw new Error(result.message || 'Profile completion failed');
        }
        setCookie("trainerId", result.data.trainer_obj.trainerId);
        setCookie("fullName", result.data.user.full_name);
        setCookie("city", result.data.user.city);
        setCookie("status", result.data.user.status);
        setCookie("role_type", "ROLE_USER");
        setCookie("session", result.data.token);
        setCookie("refresh_token", result.data.refresh_token);
        setCookie("token", result.data.token);

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
        console.log('getTrainerClients - Full API Response:', JSON.stringify(result, null, 2));

        if (!response.ok) {
            console.log('getTrainerClients - API Error:', result);
            return {
                success: false,
                message: result.message || 'Failed to fetch clients'
            };
        }

        // Check if the response has the expected structure
        if (result.code === "0000" && result.data && result.data.clients) {
            console.log('getTrainerClients - Success, clients array:', result.data.clients);
            console.log('getTrainerClients - Number of clients:', result.data.clients.length);
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
    isDropSet: boolean;
    reps: string;
    notes: string;
    sets: string;
    targetMuscles: string;
    restBetweenSets: string;
    name: string;
    weight: string;
    equipment: string;
    tempo: string;
    isSuperSet: boolean;
    superSetGroup: string | null;
}

export interface UserInfo {
    username: string;
    trainerId: string;
}

export interface Notes {
    general: string | null;
    cooldown: string | null;
    warmup: string | null;
}

export interface HistoryInfo {
    historyId: string;
    programName: string;
    currentWeek: number;
    status: string;
}

export interface ScheduleInfo {
    duration: string;
    startDateTime: string;
    isRestDay: boolean;
    endDateTime: string;
}

export async function getWorkouts(trainerId?: string) {
    try {
        const token = await getCookie('session');
        if (!token) {
            console.warn("No authentication token found");
            return {
                success: false,
                message: 'Authentication required',
                code: "0001"
            };
        }

        console.log("=== Get Workouts Request ===");
        console.log("TrainerId:", trainerId);
        console.log("Token:", token ? "Present" : "Missing");

        // Primary: use configured API base (usually includes /api), empty body
        const primaryUrl = `${API_BASE_URL}/workout/get-workouts`;
        console.log("getWorkouts: primary URL:", primaryUrl);
        // Endpoint accepts empty JSON body
        const requestBody = {};
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
        } as Record<string, string>;

        const response = await fetch(primaryUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        });
        
        let textBody = '';
        let result: any = null;
        const safeParseJson = (text: string) => {
            try {
                const trimmed = (text || '').trim();
                const start = trimmed.indexOf('{');
                const end = trimmed.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                    return JSON.parse(trimmed.slice(start, end + 1));
                }
                return null;
            } catch {
                return null;
            }
        };
        try {
            textBody = await response.text();
            result = safeParseJson(textBody) ?? {};
        } catch (parseErr) {
            console.error('getWorkouts: JSON parse error on primary URL. Raw body preview:', textBody?.slice(0, 500));
        }

        // Fallback: if not ok or failed to parse JSON, retry without trailing /api
        let finalResponse = response;
        let finalResult: any = result;
        let finalTextBody = textBody;
        if (!response.ok || !result || !result.data) {
            // Fallback: try without /api prefix
            const fallbackUrl = `http://localhost:8080/workout/get-workouts`;
            console.warn('getWorkouts: retrying with explicit localhost URL:', fallbackUrl);
            const fallbackResp = await fetch(fallbackUrl, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(requestBody)
            });
            let fbText = '';
            let fbJson: any = null;
            try {
                fbText = await fallbackResp.text();
                fbJson = safeParseJson(fbText) ?? {};
            } catch (e) {
                console.error('getWorkouts: JSON parse error on fallback URL. Raw body preview:', fbText?.slice(0, 500));
            }
            finalResponse = fallbackResp;
            finalResult = fbJson;
            finalTextBody = fbText;
        }

        console.log("=== Full API Response (final) ===");
        if (finalResult && finalResult.data) {
            // Avoid flooding logs; print only keys and first item
            console.log({
                code: finalResult.code,
                title: finalResult.title,
                message: finalResult.message,
                hasData: !!finalResult.data,
                workoutsCount: Array.isArray(finalResult.data?.workouts) ? finalResult.data.workouts.length : 0,
                firstWorkoutPreview: Array.isArray(finalResult.data?.workouts) ? {
                    id: finalResult.data.workouts[0]?.id,
                    name: finalResult.data.workouts[0]?.name,
                    day: finalResult.data.workouts[0]?.day,
                    startDateTime: finalResult.data.workouts[0]?.startDateTime,
                    endDateTime: finalResult.data.workouts[0]?.endDateTime,
                    status: finalResult.data.workouts[0]?.status
                } : null
            });
        } else {
            console.log('(non-JSON body)\n' + (finalTextBody || '(empty)'));
        }

        if (!finalResponse.ok || !finalResult || !finalResult.data) {
            console.error("API Error Response:", {
                status: finalResponse.status,
                statusText: finalResponse.statusText,
                url: finalResponse.url,
                error: finalResult || finalTextBody,
                requestBody
            });
            // Fallback 2: try upcoming endpoint to keep UI working
            try {
                const upcomingUrl = `${API_BASE_URL}/workout/upcoming?days=7`;
                console.warn('getWorkouts: falling back to upcoming schedules:', upcomingUrl);
                const upResp = await fetch(upcomingUrl, {
                    method: 'GET',
                    headers: requestHeaders,
                });
                if (upResp.ok) {
                    const upJson = await upResp.json();
                    const schedules = upJson?.data?.userSchedules || {};
                    const flat: any[] = [];
                    Object.values(schedules).forEach((arr: any) => {
                        if (Array.isArray(arr)) flat.push(...arr);
                    });
                    const mappedWorkouts = (flat as any[]).map((w: any, idx: number) => ({
                        id: idx + 1,
                        intensity: 'MEDIUM',
                        exerciseDetails: {
                            isDropSet: false,
                            reps: '-',
                            notes: '',
                            sets: '-',
                            targetMuscles: '',
                            restBetweenSets: '',
                            name: w.workoutName || 'Workout',
                            weight: '-',
                            equipment: '',
                            tempo: '',
                            isSuperSet: false,
                            superSetGroup: null,
                        },
                        notes: {
                            general: null,
                            cooldown: null,
                            warmup: null,
                        },
                        historyInfo: {
                            historyId: String(idx + 1),
                            programName: 'Upcoming Workouts',
                            currentWeek: Number(w.weekNumber || 1),
                            status: w.status || 'PLANNED',
                        },
                        scheduleInfo: {
                            duration: '60',
                            startDateTime: (() => {
                                const t = (w.startTime || '00:00').padStart(5, '0');
                                return new Date().toISOString().slice(0, 10) + 'T' + t + ':00';
                            })(),
                            isRestDay: false,
                            endDateTime: (() => {
                                const t = (w.endTime || '01:00').padStart(5, '0');
                                return new Date().toISOString().slice(0, 10) + 'T' + t + ':00';
                            })(),
                        },
                        type: 'WORKOUT',
                        day: String(w.day || '').toUpperCase(),
                        weekNumber: Number(w.weekNumber || 1),
                        status: w.status || 'PLANNED',
                        focusArea: '',
                    }));
                    return {
                        success: true,
                        data: { workouts: mappedWorkouts },
                        code: upJson?.code || '0000',
                        message: 'Using upcoming schedules as fallback'
                    };
                }
            } catch (e) {
                console.error('getWorkouts: fallback to upcoming failed:', e);
            }
            return {
                success: false,
                message: finalResult?.message || `Failed to fetch workouts: ${finalResponse.status}`,
                code: finalResult?.code || "0001"
            };
        }

        // Handle response data
        const rawWorkouts = Array.isArray(finalResult.data?.workouts) ? finalResult.data.workouts : [];

        // Map backend response to UI-expected WorkoutResponse structure
        const toMinutes = (timeStr: string) => {
            if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '0';
            const [h, m] = timeStr.split(':').map((n: string) => parseInt(n, 10) || 0);
            return String(h * 60 + m);
        };

        const durationBetween = (start: string, end: string) => {
            const startMin = parseInt(toMinutes(start), 10) || 0;
            const endMin = parseInt(toMinutes(end), 10) || 0;
            const diff = Math.max(0, endMin - startMin);
            return String(diff || (parseInt(toMinutes(start), 10) ? 60 : 0));
        };

        const toIsoDateTime = (timeStr: string) => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const safeTime = timeStr && /\d{2}:\d{2}/.test(timeStr) ? `${timeStr}:00` : '00:00:00';
            return `${yyyy}-${mm}-${dd}T${safeTime}`;
        };

        const mappedWorkouts = rawWorkouts.map((w: any) => ({
            id: w.id,
            intensity: w.intensity || 'MEDIUM',
            exerciseDetails: {
                isDropSet: Boolean(w.isDropSet),
                reps: String(w.reps ?? '-'),
                notes: w.exerciseNotes || '',
                sets: String(w.sets ?? '-'),
                targetMuscles: w.targetMuscles || '',
                restBetweenSets: w.restBetweenSets || '',
                name: w.name || 'Workout',
                weight: w.weight || '-',
                equipment: w.equipment || '',
                tempo: w.tempo || '',
                isSuperSet: Boolean(w.isSuperSet),
                superSetGroup: w.superSetGroup ?? null,
            },
            notes: {
                general: w.generalNotes ?? null,
                cooldown: w.cooldownNotes ?? null,
                warmup: w.warmupNotes ?? null,
            },
            historyInfo: {
                historyId: String(w.workoutHistory?.historyId ?? w.id ?? ''),
                programName: w.workoutHistory?.programName || 'My Workouts',
                currentWeek: Number(w.workoutHistory?.currentWeek ?? w.weekNumber ?? 1),
                status: w.workoutHistory?.status || w.status || 'PLANNED',
            },
            scheduleInfo: {
                duration: String(w.duration ?? durationBetween(w.startDateTime, w.endDateTime)),
                startDateTime: toIsoDateTime(w.startDateTime),
                isRestDay: Boolean(w.isRestDay),
                endDateTime: toIsoDateTime(w.endDateTime),
            },
            type: w.type || 'WORKOUT',
            day: (w.day || '').toUpperCase(),
            weekNumber: Number(w.weekNumber ?? w.workoutHistory?.currentWeek ?? 1),
            status: w.status || 'PLANNED',
            focusArea: (w.focusArea || '').toString(),
        }));

        console.log("=== Processed Workouts (mapped) ===");
        console.log(`Found ${mappedWorkouts.length} workouts`);
        if (mappedWorkouts.length > 0) {
            console.log("First 3 mapped:", mappedWorkouts.slice(0, 3));
        }

        return {
            success: true,
            data: {
                workouts: mappedWorkouts
            },
            code: finalResult.code || "0000",
            message: finalResult.message || "Workouts retrieved successfully"
        };
    } catch (error) {
        console.error('=== Workout Fetch Error ===');
        console.error('Error:', error instanceof Error ? error.message : error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace available');
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch workouts',
            code: "0001"
        };
    }
}

// Advanced Workout Program Types
export interface AdvancedExercise {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    equipment: string;
    targetMuscles: string;
    notes: string;
    restBetweenSets: string;
    tempo: string;
    isDropSet: boolean;
    isSuperSet: boolean;
    superSetGroup?: string;
    progressionStrategy: string;
}

export interface AdvancedWorkoutDay {
    day: string;
    focusArea: string;
    startTime: string;
    duration: number;
    intensity: string;
    warmupNotes?: string;
    cooldownNotes?: string;
    generalNotes?: string;
    exercises: AdvancedExercise[];
    isRestDay?: boolean;
}

export interface AdvancedWorkoutWeek {
    weekNumber: number;
    weeklyGoal: string;
    notes: string;
    workoutDays: AdvancedWorkoutDay[];
}

export interface AdvancedWorkoutProgram {
    clientId: string;
    programName: string;
    programDescription: string;
    startDate: string;
    endDate: string;
    difficulty: string;
    goal: string;
    weeks: AdvancedWorkoutWeek[];
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

        console.log("=== Create Advanced Workout Request ===");
        console.log("Workout Program:", JSON.stringify(workoutProgram, null, 2));

        const response = await fetch(`${API_BASE_URL}/workout/create-workouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(workoutProgram)
        });

        const result = await response.json();
        
        console.log("=== Create Advanced Workout Response ===");
        console.log(JSON.stringify(result, null, 2));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to create advanced workout program'
            };
        }

        return {
            success: true,
            data: result.data,
            message: result.message || 'Advanced workout program created successfully'
        };
    } catch (error) {
        console.error('Create advanced workout error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create advanced workout program'
        };
    }
}

export async function calculateHealthMetrics(healthData: {
    age: number;
    gender: string;
    height_cm: number;
    weight_kg: number;
    activity_level: string;
    fitness_goal: string;
    has_diabetes: boolean;
    has_hypertension: boolean;
    is_vegetarian: boolean;
    spice_tolerance: string;
}) {
    try {
        console.log("=== Calculate Health Metrics Request ===");
        console.log("Health Data:", JSON.stringify(healthData, null, 2));

        const response = await fetch('http://localhost:8000/calculate-health-metrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(healthData)
        });

        const result = await response.json();
        
        console.log("=== Calculate Health Metrics Response ===");
        console.log(JSON.stringify(result, null, 2));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to calculate health metrics'
            };
        }

        return {
            success: true,
            data: result,
            message: 'Health metrics calculated successfully'
        };
    } catch (error) {
        console.error('Calculate health metrics error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to calculate health metrics'
        };
    }
}

export async function generateMealPlan(mealPlanData: {
    user_id: string;
    target_calories: number;
    n_days: number;
    meal_plan_type: string;
}) {
    try {
        console.log("=== Generate Meal Plan Request ===");
        console.log("Meal Plan Data:", JSON.stringify(mealPlanData, null, 2));

        const response = await fetch('http://localhost:8000/generate-meal-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(mealPlanData)
        });

        const result = await response.json();
        
        console.log("=== Generate Meal Plan Response ===");
        console.log(JSON.stringify(result, null, 2));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to generate meal plan'
            };
        }

        return {
            success: true,
            data: result,
            message: 'Meal plan generated successfully'
        };
    } catch (error) {
        console.error('Generate meal plan error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to generate meal plan'
        };
    }
}

export async function generateWorkoutPlan(workoutPlanData: {
    user_id: string;
    duration_minutes: number;
    workout_type: string;
    n_days: number;
}) {
    try {
        console.log("=== Generate Workout Plan Request ===");
        console.log("Workout Plan Data:", JSON.stringify(workoutPlanData, null, 2));

        const response = await fetch('http://localhost:8000/generate-workout-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(workoutPlanData)
        });

        const result = await response.json();

        console.log("=== Generate Workout Plan Response ===");
        console.log(JSON.stringify(result, null, 2));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to generate workout plan'
            };
        }

        return {
            success: true,
            data: result,
            message: 'Workout plan generated successfully'
        };
    } catch (error) {
        console.error('Generate workout plan error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to generate workout plan'
        };
    }
}

export async function activateTrainer(activationData: {
    email: string;
    amount: number;
}) {
    try {
        console.log("=== Trainer Activation Request ===");
        console.log("Activation Data:", JSON.stringify(activationData, null, 2));

        const response = await fetch(`${API_BASE_URL}/user/trainer-activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activationData)
        });

        const result = await response.json();

        console.log("=== Trainer Activation Response ===");
        console.log(JSON.stringify(result, null, 2));

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Failed to activate trainer'
            };
        }

        // Check if the response has the expected success code
        if (result.code === "0000") {
            return {
                success: true,
                data: result.data,
                message: result.message || 'User Activate Successfully'
            };
        }

        return {
            success: false,
            message: result.message || 'Failed to activate trainer'
        };
    } catch (error) {
        console.error('Trainer activation error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to activate trainer'
        };
    }
}

export async function getUpcomingPayments(trainerId: string) {
    console.log('🔍 getUpcomingPayments called with trainerId:', trainerId);
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/upcoming/${trainerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('📡 getUpcomingPayments API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ getUpcomingPayments API error:', response.status, errorText);
            throw new Error(`Failed to fetch upcoming payments: ${response.status}`);
        }

        const result = await response.json();
        console.log('📊 getUpcomingPayments full API response:', JSON.stringify(result, null, 2));
        console.log('📊 getUpcomingPayments number of payments:', result?.length || 0);
        console.log('✅ getUpcomingPayments API call successful');
        
        return {
            success: true,
            data: result || []
        };
    } catch (error) {
        console.error('❌ getUpcomingPayments error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function getUpcomingWorkouts(days: number = 7) {
    console.log('🏋️‍♂️ ===== API: getUpcomingWorkouts =====');
    console.log('🏋️‍♂️ API called with days parameter:', days);
    console.log('🏋️‍♂️ This is a test log to verify function is called');
    
    try {
        // Get JWT token from cookies
        console.log('🏋️‍♂️ Getting JWT token from session cookie...');
        const token = await getCookie('session');
        console.log('🏋️‍♂️ Token found:', token ? 'Yes' : 'No');
        console.log('🏋️‍♂️ Token length:', token?.length || 0);
        
        if (!token) {
            console.error('🏋️‍♂️ ❌ No authentication token found');
            throw new Error('No authentication token found');
        }

        const apiUrl = `${API_BASE_URL}/workout/upcoming?days=${days}`;
        console.log('🏋️‍♂️ Making API request to:', apiUrl);
        console.log('🏋️‍♂️ Request headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.substring(0, 20)}...` // Log only first 20 chars for security
        });

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('🏋️‍♂️ API response status:', response.status);
        console.log('🏋️‍♂️ API response ok:', response.ok);
        console.log('🏋️‍♂️ API response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('🏋️‍♂️ ❌ API error response:', response.status, errorText);
            throw new Error(`Failed to fetch upcoming workouts: ${response.status}`);
        }

        const result = await response.json();
        console.log('🏋️‍♂️ Raw API response:', JSON.stringify(result, null, 2));
        console.log('🏋️‍♂️ Response type:', typeof result);
        console.log('🏋️‍♂️ Response is array:', Array.isArray(result));
        console.log('🏋️‍♂️ Number of workouts in response:', result?.length || 0);
        console.log('🏋️‍♂️ ✅ API call successful');
        
        return {
            success: true,
            data: result || []
        };
    } catch (error) {
        console.error('🏋️‍♂️ ❌ API error:', error);
        console.error('🏋️‍♂️ ❌ Error type:', typeof error);
        console.error('🏋️‍♂️ ❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// ===== User: Health (me) =====
export interface UserHealthData {
    height: string; // e.g., "178cm"
    weight: string; // e.g., "82kg"
    injuries: string;
}

export async function getUserHealth() {
    try {
        const token = await getCookie('session');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required',
                code: '0001'
            } as const;
        }

        const headers = {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        } as Record<string, string>;

        const primaryUrl = `${API_BASE_URL}/user/me/health`;
        let response = await fetch(primaryUrl, { method: 'GET', headers });
        let result: any = null;
        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (!response.ok || !result?.data) {
            const fallbackUrl = `http://localhost:8080/user/me/health`;
            const fbResp = await fetch(fallbackUrl, { method: 'GET', headers });
            let fbJson: any = null;
            try {
                fbJson = await fbResp.json();
            } catch {
                fbJson = null;
            }
            response = fbResp;
            result = fbJson;
        }

        if (!response.ok || !result?.data) {
            return {
                success: false,
                message: result?.message || `Failed to fetch user health: ${response.status}`,
                code: result?.code || '0001'
            } as const;
        }

        return {
            success: true,
            data: result.data as UserHealthData,
            code: result.code || '0000',
            message: result.message || 'Health details fetched'
        } as const;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch user health',
            code: '0001'
        } as const;
    }
}

// ===== Trainer: Me (for client) =====
export interface TrainerMeResponseData {
    trainer: {
        id: number;
        name: string;
        trainerId: string;
        servicePeriod: string;
        weight: string;
        height: string;
        profile: string;
        mobile: string;
        email: string;
        location: string;
        rating: string;
    };
    workoutHistoryId: string;
}

export async function getTrainerMe() {
    try {
        const token = await getCookie('session');
        if (!token) {
            return {
                success: false,
                message: 'Authentication required',
                code: '0001'
            } as const;
        }

        const headers = {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        } as Record<string, string>;

        const primaryUrl = `${API_BASE_URL}/trainer/me`;
        let response = await fetch(primaryUrl, { method: 'GET', headers });
        let result: any = null;
        let textBody = '';
        try {
            textBody = await response.text();
            result = textBody ? JSON.parse(textBody) : {};
        } catch {
            // ignore parse error; will attempt fallback
        }

        if (!response.ok || !result?.data?.trainer) {
            const fallbackUrl = `http://localhost:8080/trainer/me`;
            const fbResp = await fetch(fallbackUrl, { method: 'GET', headers });
            let fbJson: any = null;
            let fbText = '';
            try {
                fbText = await fbResp.text();
                fbJson = fbText ? JSON.parse(fbText) : {};
            } catch {
                // ignore parse error
            }
            response = fbResp;
            result = fbJson;
        }

        if (!response.ok || !result || !result.data || !result.data.trainer) {
            return {
                success: false,
                message: result?.message || `Failed to fetch trainer details: ${response.status}`,
                code: result?.code || '0001'
            } as const;
        }

        const data = result.data as TrainerMeResponseData;
        return {
            success: true,
            data,
            code: result.code || '0000',
            message: result.message || 'Trainer details fetched'
        } as const;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch trainer details',
            code: '0001'
        } as const;
    }
}

// Activity Audit Types
export interface ActivityAuditItem {
    id: string;
    type: 'client_registration' | 'workout_completed' | 'payment_received' | 'program_created' | 'session_scheduled' | 'goal_achieved' | 'api_request' | 'client_action' | 'gym_registration' | 'admin_action' | 'system_action';
    title: string;
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
    actorType?: string;
    actorId?: string;
    actorName?: string;
    activityType?: string;
    metadata?: {
        programName?: string;
        workoutType?: string;
        amount?: number;
        goalType?: string;
        endpoint?: string;
        method?: string;
        [key: string]: any;
    };
}

export interface ActivityAuditResponse {
    activities: ActivityAuditItem[];
    totalCount: number;
    days: number;
}

// Raw API response structure
interface RawActivityItem {
    actorType: string;
    actorId: string;
    actorName: string;
    activityType: string;
    description: string;
    occurredAt: string;
}

// Transform raw API data to user-friendly activities
function transformActivityData(rawActivities: RawActivityItem[]): ActivityAuditItem[] {
    console.log('📊 ===== TRANSFORMING ACTIVITY DATA =====');
    console.log('📊 Raw activities count:', rawActivities.length);
    
    const transformedActivities: ActivityAuditItem[] = [];
    
    rawActivities.forEach((rawActivity, index) => {
        console.log(`📊 Processing raw activity ${index + 1}:`, rawActivity);
        
        // Skip internal API requests and focus on user-relevant activities
        if (rawActivity.description.includes('/api/activity/audit') || 
            rawActivity.description.includes('/api/workout/upcoming')) {
            console.log(`📊 Skipping internal API request: ${rawActivity.description}`);
            return;
        }
        
        // Map different activity types to user-friendly descriptions
        let activityItem: ActivityAuditItem;
        
        if (rawActivity.description.includes('/api/trainer/get-clients')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_action',
                title: 'Client Data Accessed',
                description: 'Viewed client information and progress',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'GET'
                }
            };
        } else if (rawActivity.description.includes('/api/trainer/add-client')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_registration',
                title: 'New Client Added',
                description: 'Added a new client to the training program',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/workout/create-workouts')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'program_created',
                title: 'Workout Program Created',
                description: 'Created a new workout program for a client',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/upcoming/')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'payment_received',
                title: 'Payment Information Accessed',
                description: 'Checked upcoming payment information',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'GET'
                }
            };
        } else if (rawActivity.description.includes('/api/gym/register/gym')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'gym_registration',
                title: 'New Gym Registered',
                description: 'Registered a new gym to the platform',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/trainer-activate')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'admin_action',
                title: 'Trainer Activated',
                description: 'Activated a trainer account',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/gov-user/register')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_registration',
                title: 'User Profile Completed',
                description: 'Completed user profile registration',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/client-register')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_registration',
                title: 'Client Profile Completed',
                description: 'Completed client profile registration',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/register-init')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_registration',
                title: 'Registration Initiated',
                description: 'Started registration process',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/register-verify')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'client_registration',
                title: 'Registration Verified',
                description: 'Verified registration with OTP',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else if (rawActivity.description.includes('/api/user/login')) {
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'system_action',
                title: 'User Login',
                description: 'User logged into the system',
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'POST'
                }
            };
        } else {
            // Generic activity for other API calls
            activityItem = {
                id: `activity-${index}-${rawActivity.occurredAt}`,
                type: 'api_request',
                title: 'System Activity',
                description: `Performed action: ${rawActivity.description}`,
                timestamp: rawActivity.occurredAt,
                actorType: rawActivity.actorType,
                actorId: rawActivity.actorId,
                actorName: rawActivity.actorName,
                activityType: rawActivity.activityType,
                metadata: {
                    endpoint: rawActivity.description,
                    method: 'API'
                }
            };
        }
        
        console.log(`📊 Transformed activity ${index + 1}:`, activityItem);
        transformedActivities.push(activityItem);
    });
    
    console.log('📊 Total transformed activities:', transformedActivities.length);
    console.log('📊 Transformed activities preview:', transformedActivities.slice(0, 3));
    
    return transformedActivities;
}

export async function getActivityAudit(days: number = 7) {
    console.log('📊 ===== API: getActivityAudit =====');
    console.log('📊 API called with days parameter:', days);
    console.log('📊 API Base URL:', API_BASE_URL);
    console.log('📊 Timestamp:', new Date().toISOString());
    
    try {
        // Get JWT token from cookies
        console.log('📊 Getting JWT token from session cookie...');
        const token = await getCookie('session');
        console.log('📊 Token found:', token ? 'Yes' : 'No');
        console.log('📊 Token length:', token?.length || 0);
        console.log('📊 Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        if (!token) {
            console.error('📊 ❌ No authentication token found');
            console.error('📊 ❌ Available cookies check needed');
            throw new Error('No authentication token found');
        }

        const apiUrl = `${API_BASE_URL}/activity/audit?days=${days}`;
        console.log('📊 Making API request to:', apiUrl);
        console.log('📊 Request headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.substring(0, 20)}...` // Log only first 20 chars for security
        });

        const requestStartTime = Date.now();
        console.log('📊 Request start time:', new Date(requestStartTime).toISOString());

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const requestEndTime = Date.now();
        const requestDuration = requestEndTime - requestStartTime;
        
        console.log('📊 Request completed in:', requestDuration, 'ms');
        console.log('📊 API response status:', response.status);
        console.log('📊 API response ok:', response.ok);
        console.log('📊 API response status text:', response.statusText);
        console.log('📊 API response headers:', Object.fromEntries(response.headers.entries()));
        console.log('📊 Response URL:', response.url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('📊 ❌ API error response:', response.status, errorText);
            console.error('📊 ❌ Full error response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText
            });
            throw new Error(`Failed to fetch activity audit: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('📊 Raw API response type:', typeof result);
        console.log('📊 Raw API response is array:', Array.isArray(result));
        console.log('📊 Raw API response keys:', result ? Object.keys(result) : 'No keys');
        console.log('📊 Raw API response:', JSON.stringify(result, null, 2));
        
        // Log specific data structure analysis
        if (result && typeof result === 'object') {
            if (result.data && result.data.activities) {
                console.log('📊 Activities array found in data.activities, length:', result.data.activities.length);
                console.log('📊 First activity:', result.data.activities[0]);
                
                // Transform the raw activities to user-friendly format
                const transformedActivities = transformActivityData(result.data.activities);
                
                console.log('📊 ✅ API call successful with transformation');
                console.log('📊 Returning transformed data:', {
                    success: true,
                    originalCount: result.data.activities.length,
                    transformedCount: transformedActivities.length,
                    hasActivities: transformedActivities.length > 0
                });
                
                return {
                    success: true,
                    data: {
                        activities: transformedActivities,
                        totalCount: transformedActivities.length,
                        days: days
                    }
                };
            } else if (Array.isArray(result)) {
                console.log('📊 Response is direct array, length:', result.length);
                console.log('📊 First item:', result[0]);
                
                // Transform if it's a direct array
                const transformedActivities = transformActivityData(result);
                
                return {
                    success: true,
                    data: {
                        activities: transformedActivities,
                        totalCount: transformedActivities.length,
                        days: days
                    }
                };
            } else {
                console.log('📊 Response structure:', Object.keys(result));
                console.log('📊 No activities found in response');
                
                return {
                    success: true,
                    data: {
                        activities: [],
                        totalCount: 0,
                        days: days
                    }
                };
            }
        }
        
        console.log('📊 ✅ API call successful but no data structure recognized');
        return {
            success: true,
            data: {
                activities: [],
                totalCount: 0,
                days: days
            }
        };
    } catch (error) {
        console.error('📊 ❌ API error occurred at:', new Date().toISOString());
        console.error('📊 ❌ Error type:', typeof error);
        console.error('📊 ❌ Error name:', error instanceof Error ? error.name : 'Unknown');
        console.error('📊 ❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('📊 ❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('📊 ❌ Full error object:', error);
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}