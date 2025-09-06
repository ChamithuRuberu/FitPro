'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiClock, FiActivity, FiSearch, FiFilter, FiStar, FiCopy, FiCheck } from 'react-icons/fi';
import { getTrainerList } from '@/lib/api';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

interface Trainer {
  id: number;
  name: string;
  trainerId: string;
  servicePeriod: string;
  weight: string;
  height: string;
  profile: string;
}

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    minRating: '',
    experienceLevel: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  

  // Experience level options
  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: '0-2 years' },
    { value: 'intermediate', label: '2-5 years' },
    { value: 'expert', label: '5+ years' }
  ];

  // Fetch trainers on component mount
  useEffect(() => {
    const fetchTrainersData = async () => {
      try {
        setLoading(true);
        const result = await getTrainerList();
        
        if (!result.success) {
          setError(result.message || 'Failed to load trainers');
          return;
        }
        
        // Check if result has the expected format with trainers nested under data
        if (result.data && result.data.trainers) {
          setTrainers(result.data.trainers);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        setError('Error fetching trainers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainersData();
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

  // Handle copying trainer ID to clipboard
  const copyTrainerId = (id: string) => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedId(id);
        toast.success('Trainer ID copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
      })
      .catch(() => {
        toast.error('Failed to copy ID');
      });
  };

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
    <>        <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
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
            <div className="flex space-x-1">
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
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search by ID or name..."
                className="px-3 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-md transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <FiFilter className="w-4 h-4" />
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
                  className="px-3 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-2 text-xs text-gray-600">
            {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
            {(searchQuery || filters.name || filters.experienceLevel) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ name: '', minRating: '', experienceLevel: '' });
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="px-4 py-5">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{trainer.name}</h3>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Trainer ID</span>
                    <div 
                      className="bg-blue-50 rounded-md px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => copyTrainerId(trainer.trainerId)}
                      title="Click to copy"
                    >
                      <span className="font-medium text-blue-800 text-sm tracking-wide">{trainer.trainerId}</span>
                      <div className="flex items-center">
                        {copiedId === trainer.trainerId ? (
                          <span className="text-xs text-green-600 mr-1">Copied!</span>
                        ) : (
                          <span className="text-xs text-blue-600 mr-1">Copy</span>
                        )}
                        {copiedId === trainer.trainerId ? 
                          <FiCheck className="h-3.5 w-3.5 text-green-500" /> : 
                          <FiCopy className="h-3.5 w-3.5 text-blue-500" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gray-100 my-3"></div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <FiClock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Experience: {trainer.servicePeriod} years</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-gray-700">
                      <FiActivity className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{trainer.weight} kg</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiActivity className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{trainer.height} cm</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-gray-600 text-sm line-clamp-2">{trainer.profile}</p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <div className="text-center py-6">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-md">
              <p className="text-gray-500 text-base mb-2">No trainers found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ name: '', minRating: '', experienceLevel: '' });
                }}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
</>

  );
} 
