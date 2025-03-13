'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheck } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { user_login } from '@/actions';

interface LoginFormData {
  email: string;
  password: string;
}

export default function ClientLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loadingToast = toast.loading('Signing in...');

    try {
      const result = await user_login(formData.email, formData.password);
      
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }

      if (!result.data) {
        throw new Error('No data received from login');
      }

      toast.success('Login successful!');
      router.push('/dashboard/client-dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Image and Content */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 to-blue-700/50" />
        <Image
          src="/images/fitness-bg.jpg"
          alt="Fitness motivation"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-shadow-2xl font-serif">Welcome Back</h1>
            <p className="text-lg text-white mb-8 font-sans">
              Your journey to a healthier lifestyle continues here. Access your personalized workout plans and track your progress.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiCheck className="w-5 h-5 text-green-300" />
                <span>Personalized Workout Plans</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheck className="w-5 h-5 text-green-300" />
                <span>Progress Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheck className="w-5 h-5 text-green-300" />
                <span>Nutritional Guidance</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCheck className="w-5 h-5 text-green-300" />
                <span>Expert Trainer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FiUser className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Client Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register-init" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up now
              </Link>
            </p>
          </div>
          
          <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 p-4">
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
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition duration-150 ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <FiArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 