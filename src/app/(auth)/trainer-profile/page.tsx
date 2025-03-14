'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiUser, FiMapPin, FiLock, FiClock, FiActivity } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { completeTrainerProfile, getSession } from '@/actions';
import type { TrainerProfileData } from '@/actions';
import { ApiResponse } from '@/types/api';

export default function TrainerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<TrainerProfileData>({
    username: '',
    name: '',
    city: '',
    password: '',
    role_type: 'ROLE_TRAINER',
    servicePeriod: '',
    weight: '',
    height: '',
    profile: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const username = searchParams.get('username');
      if (!username) {
        toast.error('Invalid access');
        router.push('/login');
        return;
      }

      setFormData(prev => ({
        ...prev,
        username,
        role_type: 'ROLE_TRAINER'
      }));
    };

    checkSession();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loadingToast = toast.loading('Completing your profile...');

    try {
      // Validate name format
      const nameRegex = /^(?![ .]+$)[a-zA-Z .]*$/;
      if (!nameRegex.test(formData.name)) {
        throw new Error('Please enter a valid name');
      }

      // Validate password
      if (!formData.password) {
        throw new Error('Password should not be empty');
      }

      const result = await completeTrainerProfile(formData) as unknown as ApiResponse<AuthResponse>;
      console.log('Profile completion result:', result);

      if (result.code !== "0000") {
        throw new Error(result.message || 'Profile completion failed');
      }

      // Store tokens in cookies
      document.cookie = `token=${result.data.token}; path=/`;
      document.cookie = `refresh_token=${result.data.refresh_token}; path=/`;

      toast.success(result.message || 'Profile completed successfully!');
      
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/trainer-admin');
    } catch (err) {
      console.error('Profile completion error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Trainer Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your professional details
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  pattern="^(?![ .]+$)[a-zA-Z .]*$"
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* City Field */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Service Period Field */}
            <div>
              <label htmlFor="servicePeriod" className="block text-sm font-medium text-gray-700">
                Service Period (years)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="servicePeriod"
                  name="servicePeriod"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  value={formData.servicePeriod}
                  onChange={(e) => setFormData({ ...formData, servicePeriod: e.target.value })}
                />
              </div>
            </div>

            {/* Weight and Height Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiActivity className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="30"
                    max="200"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiActivity className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    min="100"
                    max="250"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Profile Field */}
            <div>
              <label htmlFor="profile" className="block text-sm font-medium text-gray-700">
                Professional Profile
              </label>
              <div className="mt-1">
                <textarea
                  id="profile"
                  name="profile"
                  rows={4}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder="Describe your experience and expertise..."
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 