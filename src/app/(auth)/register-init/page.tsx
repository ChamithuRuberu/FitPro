'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiPhone } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { initializeRegistration } from '@/actions';

// Define types for our form data and API response
interface SignupFormData {
  nic: string;
  mobile: string;
  email: string;
  isTrainer: boolean;
}

interface ApiResponse {
  code: string;
  title: string;
  message: string;
  data: {
    user_role: Array<{
      id: number;
      name: string;
      status: string;
      permissions: Array<{
        id: number;
        name: string;
      }>;
    }>;
    app_user_id: string;
    mobile: string;
    trainer_id?: number;
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    nic: '',
    mobile: '',
    email: '',
    isTrainer: false,
  });

  const generateTrainerId = (): number => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loadingToast = toast.loading('Creating your account...');

    try {
      const trainerId = formData.isTrainer ? generateTrainerId() : undefined;
      
      const result = await initializeRegistration({
        nic: formData.nic,
        mobile: formData.mobile,
        email: formData.email,
        role_type: formData.isTrainer ? 'ROLE_TRAINER' : 'ROLE_USER',
        ...(trainerId && { trainer_id: trainerId })
      });

      if (result.success && result.data) {
        toast.success('Registration successful! Please verify your account.');
        router.push(`/verify?username=${encodeURIComponent(result.data.app_user_id)}`);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during registration';
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* NIC Field */}
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                NIC Number
              </label>
              <div className="mt-1">
                <input
                  id="nic"
                  name="nic"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+94 XX XXX XXXX"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Trainer Checkbox */}
            <div className="flex items-center">
              <input
                id="is_trainer"
                name="is_trainer"
                type="checkbox"
                checked={formData.isTrainer}
                onChange={(e) => setFormData({ ...formData, isTrainer: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_trainer" className="ml-2 block text-sm text-gray-900">
                I am a trainer
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 