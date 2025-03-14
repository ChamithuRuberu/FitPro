'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiClock, FiActivity, FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import { getAllTrainers } from '@/actions';
import type { TrainerListResponse } from '@/actions';

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trainers, setTrainers] = useState<TrainerListResponse['trainers']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    minRating: '',
    experienceLevel: ''
  });

  // Experience level options
  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: '0-2 years' },
    { value: 'intermediate', label: '2-5 years' },
    { value: 'expert', label: '5+ years' }
  ];

  // Fetch trainers on component mount
  useEffect(() => {
    const fetchTrainers = async () => {
      const result = await getAllTrainers();
      setLoading(false);
      
      if (!result.success) {
        setError(result.message || 'Failed to load trainers');
        return;
      }
      
      setTrainers(result.data);
    };

    fetchTrainers();
  }, []);

  // Filter trainers based on all criteria
  const filteredTrainers = trainers.filter(trainer => {
    // First filter by trainer ID if provided
    if (searchQuery && !trainer.trainerId.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }

    // Then apply additional filters
    const nameMatch = !filters.name || trainer.name.toLowerCase().includes(filters.name.toLowerCase());
    
    const experienceMatch = !filters.experienceLevel || (() => {
      const years = parseInt(trainer.servicePeriod) || 0;
      switch (filters.experienceLevel) {
        case 'beginner': return years >= 0 && years <= 2;
        case 'intermediate': return years > 2 && years <= 5;
        case 'expert': return years > 5;
        default: return true;
      }
    })();

    return nameMatch && experienceMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section with Integrated Search */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect Trainer
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Connect with professional trainers to achieve your fitness goals
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <section className="py-6 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Training Level Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, experienceLevel: '' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${!filters.experienceLevel
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                All Levels
              </button>
              {experienceLevels.filter(level => level.value).map((level) => (
                <button
                  key={level.value}
                  onClick={() => setFilters({ 
                    ...filters, 
                    experienceLevel: filters.experienceLevel === level.value ? '' : level.value 
                  })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${filters.experienceLevel === level.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {level.label}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by ID or name..."
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <FiFilter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Filter by Name</h3>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Enter trainer name..."
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
            {(searchQuery || filters.name || filters.experienceLevel) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ name: '', minRating: '', experienceLevel: '' });
                }}
                className="ml-3 text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white overflow-hidden shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <FiUser className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{trainer.name}</h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <FiMapPin className="h-4 w-4 mr-1" />
                      <span className="font-medium text-blue-600">ID: {trainer.trainerId}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center text-gray-700">
                    <FiClock className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Experience: {trainer.servicePeriod} years</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <FiActivity className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{trainer.weight} kg</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiActivity className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{trainer.height} cm</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 line-clamp-3">{trainer.profile}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {/* TODO: Implement trainer selection */}}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                  >
                    Select Trainer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
              <p className="text-gray-500 text-xl mb-2">No trainers found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ name: '', minRating: '', experienceLevel: '' });
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 