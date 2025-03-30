'use client';

import dynamic from 'next/dynamic';

const AdvancedWorkoutProgramForm = dynamic(
    () => import('@/components/dashboard/trainer/AdvancedWorkoutProgramForm'),
    { ssr: false }
);

export default function CreateProgramPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Workout Program</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Design comprehensive workout programs with detailed exercises, progressions, and schedules
                    </p>
                </div>
                
                <AdvancedWorkoutProgramForm />
            </div>
        </div>
    );
} 