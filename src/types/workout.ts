export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight?: string;
    equipment?: string;
    targetMuscles?: string;
    restBetweenSets?: string;
    tempo?: string;
    notes?: string;
}

export interface WorkoutDay {
    exercises: Exercise[];
}

export interface WorkoutWeek {
    workoutDays: WorkoutDay[];
}

export interface WorkoutProgram {
    clientId: string;
    programName: string;
    programDescription: string;
    startDate: string;
    endDate: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    goal: 'STRENGTH_AND_HYPERTROPHY' | 'WEIGHT_LOSS' | 'ENDURANCE' | 'FLEXIBILITY';
    weeks: WorkoutWeek[];
} 