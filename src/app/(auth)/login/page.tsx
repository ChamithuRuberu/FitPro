'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiActivity, FiSettings, FiArrowRight } from 'react-icons/fi';

export default function LoginSelectionPage() {
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
            <h1 className="text-4xl font-bold mb-4 text-shadow-2xl font-serif">Welcome to FitPro</h1>
            <p className="text-lg text-white mb-8 font-sans">
              Choose your login type to access your personalized dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Role Selection */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Choose Your Role
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Select the appropriate login option for your account type
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Client Login Option */}
            <Link href="/login/client" className="block">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Client Login</h3>
                    <p className="text-sm text-gray-600">Access your workout plans and track your progress</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            {/* Trainer Login Option */}
            <Link href="/login/trainer" className="block">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <FiActivity className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Trainer Login</h3>
                    <p className="text-sm text-gray-600">Manage your clients and create workout programs</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            {/* Admin Login Option */}
            <Link href="/login/admin" className="block">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FiSettings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Admin Login</h3>
                    <p className="text-sm text-gray-600">Manage gym operations and system settings</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>

          {/* Registration Link */}
          <div className="mt-8 text-center">
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
  );
} 