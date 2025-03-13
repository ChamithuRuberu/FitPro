'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiCalendar, FiMapPin } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { completeUserProfile, getSession } from '@/actions';

interface RegisterUserFormData {
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
  trainerId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterUserFormData>({
    username: '',
    name: '',
    profile: 'default',
    full_name: '',
    birth_of_date: '',
    address_no: '',
    address_street: '',
    city: '',
    password: '',
    postalCode: '',
    role_type: 'ROLE_USER',
    servicePeriod: '0',
    weight: '',
    height: '',
    injuries: '',
    trainerId: '499763' // Default trainer ID
  });

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log('User profile session:', session);
      
      if (session.success && session.data?.data?.user) {
        setFormData(prev => ({
          ...prev,
          username: session.data.data.user.username,
          role_type: 'ROLE_USER'
        }));
      } else {
        toast.error('Session not found');
        router.replace('/login');
      }
    };
    
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        'username',
        'full_name',
        'birth_of_date',
        'address_no',
        'address_street',
        'city',
        'password',
        'postalCode',
        'weight',
        'height'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof RegisterUserFormData]);
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate password
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Validate numeric fields
      if (isNaN(Number(formData.weight)) || isNaN(Number(formData.height))) {
        toast.error('Weight and height must be valid numbers');
        setLoading(false);
        return;
      }

      const requestData = {
        username: formData.username.trim(),
        name: formData.full_name.trim(),
        profile: formData.profile,
        full_name: formData.full_name.trim(),
        birth_of_date: formData.birth_of_date,
        address_no: formData.address_no.trim(),
        address_street: formData.address_street.trim(),
        city: formData.city.trim(),
        password: formData.password,
        postalCode: formData.postalCode.trim(),
        role_type: formData.role_type,
        servicePeriod: formData.servicePeriod,
        weight: formData.weight,
        height: formData.height,
        injuries: formData.injuries?.trim() || "None",
        trainerId: formData.trainerId
      };

      console.log('Submitting profile data:', requestData);
      const result = await completeUserProfile(requestData);
      console.log('Profile completion response:', result);

      if (result.success && result.data) {
        toast.success('Profile created successfully!');
        // Wait a moment for the session to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.replace('/dashboard/client-dashboard');
      } else {
        console.error('Profile completion failed:', result);
        toast.error(result.message || 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username (Email)
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.username}
                  disabled
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
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="birth_of_date" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  id="birth_of_date"
                  name="birth_of_date"
                  type="date"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.birth_of_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="address_no" className="block text-sm font-medium text-gray-700">
                  Address No
                </label>
                <input
                  id="address_no"
                  name="address_no"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="address_street" className="block text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  id="address_street"
                  name="address_street"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address_street}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Physical Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.height}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Trainer Information */}
            <div>
              <label htmlFor="trainerId" className="block text-sm font-medium text-gray-700">
                Trainer ID
              </label>
              <div className="mt-1">
                <input
                  id="trainerId"
                  name="trainerId"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.trainerId}
                  onChange={handleInputChange}
                  placeholder="Enter trainer ID (default: 499763)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use default trainer (ID: 499763)
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="injuries" className="block text-sm font-medium text-gray-700">
                Injuries/Medical Conditions
              </label>
              <textarea
                id="injuries"
                name="injuries"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.injuries}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 