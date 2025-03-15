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