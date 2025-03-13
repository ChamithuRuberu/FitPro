'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock } from 'react-icons/fi';
import { user_login } from '@/actions';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await user_login(formData.email, formData.password);
      
      if (result.success && result.data) {
        // Check if roles exist and are valid
        if (!result.data.roles || !Array.isArray(result.data.roles) || result.data.roles.length === 0) {
          console.error('Invalid roles data:', result.data);
          toast.error('Invalid user role data');
          return;
        }

        // Log the entire roles array for debugging
        console.log('Roles array:', result.data.roles);
        
        // Get the first role and log it
        const userRole = result.data.roles[0];
        console.log('First role object:', userRole);
        console.log('Role name:', userRole.name);

        toast.success('Login successful');
        
        // Store role for debugging
        const roleName = userRole.name.toUpperCase(); // Normalize to uppercase
        console.log('Normalized role name:', roleName);

        // Navigate based on role
        switch (roleName) {
          case 'ROLE_TRAINER':
            console.log('Redirecting to trainer dashboard...');
            router.push('/dashboard/trainer-admin');
            break;
          case 'ROLE_GYM':
            console.log('Redirecting to gym dashboard...');
            router.push('/dashboard/gym-admin');
            break;
          case 'ROLE_ADMIN':
            console.log('Redirecting to admin dashboard...');
            router.push('/dashboard/admin-dashboard');
            break;
          case 'ROLE_USER':
            console.log('Redirecting to client dashboard...');
            router.push('/dashboard/client-dashboard');
            break;
          default:
            console.log('Unknown role:', roleName);
            console.log('Redirecting to client dashboard...');
            router.push('/login');
            break;
        }
      } else {
        // Show specific error message from the server if available
        toast.error(result.message || 'Login failed');
        
        if (result.message === 'Invalid session data') {
          console.error('Session data validation failed');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster position="top-right" />
      
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
            <h1 className="text-4xl font-bold mb-4 text-shadow-2xl font-serif">Welcome to FitPro</h1>
            <p className="text-lg text-white mb-8 font-sans">
              Sign in to access your personalized dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          
          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

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
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register-init" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 