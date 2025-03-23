'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createAdvancedWorkout } from '@/lib/api';
import styles from '@/styles/AdvancedWorkoutForm.module.css';
import { FiInfo, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { WorkoutProgram, WorkoutWeek, WorkoutDay, Exercise } from '@/types/workout';

const FOCUS_AREAS = [
    'CHEST_AND_TRICEPS',
    'BACK_AND_BICEPS',
    'LEGS',
    'SHOULDERS_AND_ARMS',
    'CARDIO_AND_CORE',
    'FULL_BODY',
    'UPPER_BODY',
    'LOWER_BODY'
] as const;

const DAYS = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
] as const;

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const GOALS = [
    'STRENGTH_AND_HYPERTROPHY',
    'WEIGHT_LOSS',
    'ENDURANCE',
    'FLEXIBILITY',
    'GENERAL_FITNESS'
] as const;

const INTENSITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

interface AdvancedWorkoutProgramFormProps {
    clientId: string;
    onSuccess: () => void;
}

export default function AdvancedWorkoutProgramForm({ clientId, onSuccess }: AdvancedWorkoutProgramFormProps) {
    const [program, setProgram] = useState<WorkoutProgram>({
        clientId: clientId,
        programName: '',
        programDescription: '',
        startDate: '',
        endDate: '',
        difficulty: 'INTERMEDIATE',
        goal: 'STRENGTH_AND_HYPERTROPHY',
        weeks: []
    });

    const [currentWeek, setCurrentWeek] = useState<WorkoutWeek>({
        weekNumber: 1,
        weeklyGoal: '',
        notes: '',
        workoutDays: []
    });

    const [currentDay, setCurrentDay] = useState<WorkoutDay>({
        day: 'MONDAY',
        focusArea: 'CHEST_AND_TRICEPS',
        startTime: '06:30',
        duration: 90,
        intensity: 'HIGH',
        exercises: []
    });

    const [currentExercise, setCurrentExercise] = useState<Exercise>({
        name: '',
        sets: 4,
        reps: 8,
        weight: '',
        equipment: '',
        targetMuscles: '',
        notes: '',
        restBetweenSets: '120 seconds',
        tempo: '2-1-1',
        isDropSet: false,
        isSuperSet: false,
        progressionStrategy: ''
    });

    const [showExerciseForm, setShowExerciseForm] = useState(false);

    const handleAddExercise = (weekIndex: number, dayIndex: number) => {
        const exerciseName = prompt('Enter exercise name:');
        if (!exerciseName) return;

        const sets = parseInt(prompt('Enter number of sets:') || '0');
        const reps = parseInt(prompt('Enter number of reps:') || '0');

        if (sets <= 0 || reps <= 0) {
            toast.error('Sets and reps must be greater than 0');
            return;
        }

        const newExercise: Exercise = {
            name: exerciseName,
            sets,
            reps
        };

        setProgram(prev => {
            const newWeeks = [...prev.weeks];
            newWeeks[weekIndex].workoutDays[dayIndex].exercises.push(newExercise);
            return { ...prev, weeks: newWeeks };
        });
    };

    const handleAddDay = (weekIndex: number) => {
        setProgram(prev => {
            const newWeeks = [...prev.weeks];
            newWeeks[weekIndex].workoutDays.push({ exercises: [] });
            return { ...prev, weeks: newWeeks };
        });
    };

    const handleAddWeek = () => {
        setProgram(prev => ({
            ...prev,
            weeks: [...prev.weeks, { workoutDays: [] }]
        }));
    };

    const handleRemoveWeek = (weekIndex: number) => {
        setProgram(prev => ({
            ...prev,
            weeks: prev.weeks.filter((_, index) => index !== weekIndex)
        }));
    };

    const handleRemoveDay = (weekIndex: number, dayIndex: number) => {
        setProgram(prev => {
            const newWeeks = [...prev.weeks];
            newWeeks[weekIndex].workoutDays = newWeeks[weekIndex].workoutDays.filter(
                (_, index) => index !== dayIndex
            );
            return { ...prev, weeks: newWeeks };
        });
    };

    const handleRemoveExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
        setProgram(prev => {
            const newWeeks = [...prev.weeks];
            newWeeks[weekIndex].workoutDays[dayIndex].exercises = 
                newWeeks[weekIndex].workoutDays[dayIndex].exercises.filter(
                    (_, index) => index !== exerciseIndex
                );
            return { ...prev, weeks: newWeeks };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (program.weeks.length === 0) {
            toast.error('Add at least one week to the program');
            return;
        }

        try {
            const result = await createAdvancedWorkout(program);
            if (result.success) {
                toast.success('Workout program created successfully');
                onSuccess();
                // Reset form
                setProgram({
                    clientId: clientId,
                    programName: '',
                    programDescription: '',
                    startDate: '',
                    endDate: '',
                    difficulty: 'INTERMEDIATE',
                    goal: 'STRENGTH_AND_HYPERTROPHY',
                    weeks: []
                });
            } else {
                toast.error(result.message || 'Failed to create workout program');
            }
        } catch (error) {
            toast.error('Failed to create workout program');
            console.error('Create workout error:', error);
        }
    };

    return (
        <div className={styles.formContainer}>
            {/* Step 1: Program Basics */}
            <section className={styles.formSection}>
                <div className={styles.stepIndicator}>
                    <span className={styles.stepNumber}>1</span>
                    Program Basics
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={`${styles.inputLabel} ${styles.required}`}>
                            Program Name
                        </label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={program.programName}
                            onChange={(e) => setProgram({ ...program, programName: e.target.value })}
                            placeholder="e.g., 12-Week Strength Builder"
                        />
                        <span className={styles.inputHint}>Give your program a clear, descriptive name</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            Program Description
                            <FiInfo className={styles.infoIcon} title="Explain the program's focus and expected outcomes" />
                        </label>
                        <textarea
                            className={styles.textareaField}
                            value={program.programDescription}
                            onChange={(e) => setProgram({ ...program, programDescription: e.target.value })}
                            placeholder="Describe the program's goals and what clients can expect..."
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.inputLabel} ${styles.required}`}>Start Date</label>
                        <input
                            type="date"
                            className={styles.inputField}
                            value={program.startDate}
                            onChange={(e) => setProgram({ ...program, startDate: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={`${styles.inputLabel} ${styles.required}`}>End Date</label>
                        <input
                            type="date"
                            className={styles.inputField}
                            value={program.endDate}
                            onChange={(e) => setProgram({ ...program, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </section>

            {/* Step 2: Program Details */}
            <section className={styles.formSection}>
                <div className={styles.stepIndicator}>
                    <span className={styles.stepNumber}>2</span>
                    Program Details
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            Difficulty Level
                            <FiInfo className={styles.infoIcon} title="Choose based on client's fitness level" />
                        </label>
                        <select
                            className={styles.inputField}
                            value={program.difficulty}
                            onChange={(e) => setProgram({ ...program, difficulty: e.target.value })}
                        >
                            <option value="BEGINNER">Beginner - New to training</option>
                            <option value="INTERMEDIATE">Intermediate - Some experience</option>
                            <option value="ADVANCED">Advanced - Very experienced</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                            Program Goal
                            <FiInfo className={styles.infoIcon} title="Select the primary focus of this program" />
                        </label>
                        <select
                            className={styles.inputField}
                            value={program.goal}
                            onChange={(e) => setProgram({ ...program, goal: e.target.value })}
                        >
                            <option value="STRENGTH_AND_HYPERTROPHY">Strength & Muscle Building</option>
                            <option value="WEIGHT_LOSS">Weight Loss</option>
                            <option value="ENDURANCE">Endurance</option>
                            <option value="FLEXIBILITY">Flexibility & Mobility</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Step 3: Weekly Structure */}
            <section className={styles.formSection}>
                <div className={styles.stepIndicator}>
                    <span className={styles.stepNumber}>3</span>
                    Weekly Structure
                </div>
                
                {program.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className={styles.weekSection}>
                        <div className={styles.weekHeader}>
                            <h3 className={styles.weekTitle}>Week {weekIndex + 1}</h3>
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => handleRemoveWeek(weekIndex)}
                            >
                                <FiTrash2 /> Remove Week
                            </button>
                        </div>
                        
                        {week.workoutDays.map((day, dayIndex) => (
                            <div key={dayIndex} className={styles.daySection}>
                                <div className={styles.dayHeader}>
                                    <h4 className={styles.dayTitle}>Day {dayIndex + 1}</h4>
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveDay(weekIndex, dayIndex)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                
                                {day.exercises.map((exercise, exerciseIndex) => (
                                    <div key={exerciseIndex} className={styles.exerciseItem}>
                                        <div>
                                            <span className={styles.exerciseName}>{exercise.name}</span>
                                            <span className={styles.exerciseDetails}>
                                                {exercise.sets} sets × {exercise.reps} reps
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveExercise(weekIndex, dayIndex, exerciseIndex)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={() => handleAddExercise(weekIndex, dayIndex)}
                                >
                                    <FiPlus /> Add Exercise
                                </button>
                            </div>
                        ))}
                        
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => handleAddDay(weekIndex)}
                        >
                            <FiPlus /> Add Training Day
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleAddWeek}
                >
                    <FiPlus /> Add Week to Program
                </button>
            </section>

            {/* Submit Section */}
            <section className={styles.formSection}>
                <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleSubmit}
                    disabled={!program.programName || !program.startDate || !program.endDate}
                >
                    <FiCheck /> Create Workout Program
                </button>
                <p className={styles.helpText}>
                    Make sure you've added all necessary weeks, days, and exercises before creating the program
                </p>
            </section>
        </div>
    );
} 