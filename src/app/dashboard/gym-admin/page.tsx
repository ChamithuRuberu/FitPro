'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiDollarSign, FiStar, FiPlus, FiCalendar } from 'react-icons/fi';
import type { TrainerData, ClientData } from '@/types/dashboard';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

// Sample data
const gymStats = {
  monthlyRevenue: 45000,
  activeMembers: 450,
  activeTrainers: 12,
  averageRating: 4.9,
  totalPrograms: 24,
  upcomingSessions: 18,
};

const trainers: TrainerData[] = [
  {
    id: '1',
    name: 'John Smith',
    gym: 'FitPro Central',
    clientCount: 25,
    rating: 4.9,
    specializations: ['Weight Loss', 'Strength Training'],
    activePrograms: 3,
    revenue: 8500,
    status: 'active',
    nextPaymentDate: '2024-03-15',
    registeredDate: '2024-03-15',
  },
  // Add more trainers...
];

const clients: ClientData[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    program: 'Weight Loss Program',
    trainer: 'John Smith',
    progress: 75,
    attendance: 90,
    nextSession: '2024-03-15 10:00 AM',
    subscriptionStatus: 'active',
    nextPaymentDate: '2024-03-15',
    registeredDate: '2024-03-15',
  },
  // Add more clients...
];

export default function GymAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trainers' | 'clients'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Gym Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button className="btn-primary flex items-center gap-2">
                <FiPlus className="w-5 h-5" />
                Add New Trainer
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-6">
            {['overview', 'trainers', 'clients'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">${gymStats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FiDollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-semibold text-gray-900">{gymStats.activeMembers}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">{gymStats.upcomingSessions}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FiCalendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                {/* Add activity feed here */}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
                {/* Add schedule here */}
              </div>
            </div>
          </>
        )}

        {/* Trainers List */}
        {activeTab === 'trainers' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gym Trainers</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{trainer.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {trainer.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{trainer.rating}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Clients</p>
                      <p className="text-lg font-semibold">{trainer.clientCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Programs</p>
                      <p className="text-lg font-semibold">{trainer.activePrograms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-semibold">${trainer.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clients List */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Gym Members</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {clients.map((client) => (
                <div key={client.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">Trainer: {client.trainer}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-600'
                        : client.subscriptionStatus === 'expired'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {client.subscriptionStatus.charAt(0).toUpperCase() + client.subscriptionStatus.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Program</p>
                      <p className="font-medium">{client.program}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{client.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="font-medium">{client.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Session</p>
                      <p className="font-medium">{new Date(client.nextSession).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 