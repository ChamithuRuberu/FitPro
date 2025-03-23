'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createAdvancedWorkout, type AdvancedWorkoutProgram } from '@/lib/api';
import styles from '@/styles/AdvancedWorkoutForm.module.css';

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

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    equipment: string;
    targetMuscles: string;
    notes: string;
    restBetweenSets: string;
    tempo: string;
    isDropSet: boolean;
    isSuperSet: boolean;
    superSetGroup?: string;
    progressionStrategy: string;
}

interface WorkoutDay {
    day: string;
    focusArea: string;
    startTime: string;
    duration: number;
    intensity: typeof INTENSITIES[number];
    warmupNotes?: string;
    cooldownNotes?: string;
    generalNotes?: string;
    exercises: Exercise[];
    isRestDay?: boolean;
}

interface WorkoutWeek {
    weekNumber: number;
    weeklyGoal: string;
    notes: string;
    workoutDays: WorkoutDay[];
}

interface WorkoutProgram {
    clientId: string;
    programName: string;
    programDescription: string;
    startDate: string;
    endDate: string;
    difficulty: typeof DIFFICULTIES[number];
    goal: typeof GOALS[number];
    weeks: WorkoutWeek[];
}

interface AdvancedWorkoutProgramFormProps {
    clientId: string;
    onWorkoutCreated: (workout: AdvancedWorkoutProgram) => void;
    onClose: () => void;
}

export default function AdvancedWorkoutProgramForm({ clientId, onWorkoutCreated, onClose }: AdvancedWorkoutProgramFormProps) {
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

    useEffect(() => {
        setProgram(prev => ({ ...prev, clientId }));
    }, [clientId]);

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
    const [currentStep, setCurrentStep] = useState<'program' | 'week' | 'preview'>('program');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWorkoutCreated, setIsWorkoutCreated] = useState(false);

    const handleAddExercise = () => {
        if (!currentExercise.name) {
            toast.error('Exercise name is required');
            return;
        }

        setCurrentDay(prev => ({
            ...prev,
            exercises: [...prev.exercises, { ...currentExercise }]
        }));

        setCurrentExercise({
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

        setShowExerciseForm(false);
        toast.success('Exercise added successfully');
    };

    const handleAddDay = () => {
        if (!currentDay.isRestDay && currentDay.exercises.length === 0) {
            toast.error('Add at least one exercise or mark as rest day');
            return;
        }

        if (currentWeek.workoutDays.some(day => day.day === currentDay.day)) {
            toast.error('This day already exists in the current week');
            return;
        }

        setCurrentWeek(prev => ({
            ...prev,
            workoutDays: [...prev.workoutDays, { ...currentDay }].sort((a, b) => 
                DAYS.indexOf(a.day as any) - DAYS.indexOf(b.day as any)
            )
        }));

        const availableDays = DAYS.filter(day => 
            !currentWeek.workoutDays.some(d => d.day === day)
        );
        
        setCurrentDay({
            day: availableDays[0] || 'MONDAY',
            focusArea: 'CHEST_AND_TRICEPS',
            startTime: '06:30',
            duration: 90,
            intensity: 'HIGH',
            exercises: [],
            isRestDay: false
        });

        toast.success('Workout day added successfully');
    };

    const handleAddWeek = (andPreview: boolean = false) => {
        if (currentWeek.workoutDays.length === 0) {
            toast.error('Add at least one workout day to the week');
            return;
        }

        if (!currentWeek.weeklyGoal.trim()) {
            toast.error('Please set a weekly goal');
            return;
        }

        const newWeek = { ...currentWeek };
        setProgram(prev => ({
            ...prev,
            weeks: [...prev.weeks, newWeek]
        }));

        if (andPreview) {
            setCurrentStep('preview');
        } else {
            setCurrentWeek({
                weekNumber: currentWeek.weekNumber + 1,
                weeklyGoal: '',
                notes: '',
                workoutDays: []
            });
        }

        toast.success('Week added successfully');
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const response = await createAdvancedWorkout({
                clientId,
                programName: program.programName,
                programDescription: program.programDescription,
                startDate: program.startDate,
                endDate: program.endDate,
                difficulty: program.difficulty,
                goal: program.goal,
                weeks: program.weeks
            });

            if (response) {
                setIsWorkoutCreated(true);
                toast.success('Workout program created successfully! 💪', {
                    duration: 3000,
                    icon: '✅'
                });
                
                // Wait for toast to show before closing
                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Error creating workout:', error);
            toast.error('Failed to create workout program', {
                duration: 3000,
                icon: '❌'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderProgressSteps = () => (
        <div className={styles.progressSteps}>
            <div className={styles.progressStep}>
                <div className={`${styles.stepNumber} ${currentStep === 'program' ? styles.stepActive : program.programName ? styles.stepCompleted : styles.stepPending}`}>
                    1
                </div>
                <span className={styles.stepLabel}>Program Details</span>
            </div>
            <div className={styles.progressStep}>
                <div className={`${styles.stepNumber} ${currentStep === 'week' ? styles.stepActive : program.weeks.length > 0 ? styles.stepCompleted : styles.stepPending}`}>
                    2
                </div>
                <span className={styles.stepLabel}>Weekly Plan</span>
            </div>
            <div className={styles.progressStep}>
                <div className={`${styles.stepNumber} ${currentStep === 'preview' ? styles.stepActive : styles.stepPending}`}>
                    3
                </div>
                <span className={styles.stepLabel}>Review & Create</span>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            {renderProgressSteps()}

            {currentStep === 'program' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Program Details</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Program Name</label>
                                <input
                                    type="text"
                                    value={program.programName}
                                    onChange={e => setProgram(prev => ({ ...prev, programName: e.target.value }))}
                                    className={styles.inputField}
                                    placeholder="e.g., 12-Week Strength Building"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Program Description</label>
                                <textarea
                                    value={program.programDescription}
                                    onChange={e => setProgram(prev => ({ ...prev, programDescription: e.target.value }))}
                                    className={styles.textareaField}
                                    placeholder="Describe the program's focus and objectives"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Start Date</label>
                                <input
                                    type="date"
                                    value={program.startDate}
                                    onChange={e => setProgram(prev => ({ ...prev, startDate: e.target.value }))}
                                    className={styles.inputField}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>End Date</label>
                                <input
                                    type="date"
                                    value={program.endDate}
                                    onChange={e => setProgram(prev => ({ ...prev, endDate: e.target.value }))}
                                    className={styles.inputField}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Difficulty Level</label>
                                <select
                                    value={program.difficulty}
                                    onChange={e => setProgram(prev => ({ ...prev, difficulty: e.target.value as typeof DIFFICULTIES[number] }))}
                                    className={styles.inputField}
                                >
                                    {DIFFICULTIES.map(diff => (
                                        <option key={diff} value={diff}>{diff.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Program Goal</label>
                                <select
                                    value={program.goal}
                                    onChange={e => setProgram(prev => ({ ...prev, goal: e.target.value as typeof GOALS[number] }))}
                                    className={styles.inputField}
                                >
                                    {GOALS.map(goal => (
                                        <option key={goal} value={goal}>{goal.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styles.formNavigation}>
                        <div></div>
                        <button
                            type="button"
                            onClick={() => setCurrentStep('week')}
                            className={styles.btnPrimary}
                            disabled={!program.programName || !program.startDate || !program.endDate}
                        >
                            Continue to Weekly Plan
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 'week' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Week {currentWeek.weekNumber} Plan</h3>
                        <span className={styles.statusBadge}>
                            {program.weeks.length} weeks added
                        </span>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.formSection}>
                            <h4 className={styles.formSubtitle}>Weekly Goal</h4>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Goal for Week {currentWeek.weekNumber}</label>
                                    <input
                                        type="text"
                                        value={currentWeek.weeklyGoal}
                                        onChange={e => setCurrentWeek(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                                        className={styles.inputField}
                                        placeholder="e.g., Increase strength in compound lifts"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Additional Notes</label>
                                    <textarea
                                        value={currentWeek.notes}
                                        onChange={e => setCurrentWeek(prev => ({ ...prev, notes: e.target.value }))}
                                        className={styles.textareaField}
                                        placeholder="Any additional notes for this week"
                                    />
                                </div>
                            </div>
                        </div>

                        {currentWeek.workoutDays.length > 0 && (
                            <div className={styles.formSection}>
                                <h4 className={styles.formSubtitle}>Current Week Schedule</h4>
                                <div className={styles.exerciseList}>
                                    {currentWeek.workoutDays.map((day, index) => (
                                        <div key={index} className={styles.exerciseItem}>
                                            <div>
                                                <span className={styles.exerciseName}>{day.day}</span>
                                                <span className={styles.exerciseDetails}>
                                                    {day.isRestDay ? (
                                                        <span className={styles.statusBadge}>Rest Day</span>
                                                    ) : (
                                                        `${day.focusArea.replace(/_/g, ' ')} - ${day.exercises.length} exercises`
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentWeek(prev => ({
                                                        ...prev,
                                                        workoutDays: prev.workoutDays.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className={styles.removeButton}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.formSection}>
                            <h4 className={styles.formSubtitle}>Add Workout Day</h4>
                            <div className={styles.formGrid}>
                                <select
                                    value={currentDay.day}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, day: e.target.value }))}
                                    className={styles.inputField}
                                >
                                    {DAYS.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                <select
                                    value={currentDay.focusArea}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, focusArea: e.target.value }))}
                                    className={styles.inputField}
                                >
                                    {FOCUS_AREAS.map(area => (
                                        <option key={area} value={area}>{area.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <input
                                    type="time"
                                    value={currentDay.startTime}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, startTime: e.target.value }))}
                                    className={styles.inputField}
                                />
                                <input
                                    type="number"
                                    placeholder="Duration (minutes)"
                                    value={currentDay.duration}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                    className={styles.inputField}
                                />
                                <select
                                    value={currentDay.intensity}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, intensity: e.target.value as typeof INTENSITIES[number] }))}
                                    className={styles.inputField}
                                >
                                    {INTENSITIES.map(intensity => (
                                        <option key={intensity} value={intensity}>{intensity}</option>
                                    ))}
                                </select>
                                <textarea
                                    placeholder="Warmup Notes"
                                    value={currentDay.warmupNotes || ''}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, warmupNotes: e.target.value }))}
                                    className={styles.textareaField}
                                />
                                <textarea
                                    placeholder="Cooldown Notes"
                                    value={currentDay.cooldownNotes || ''}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, cooldownNotes: e.target.value }))}
                                    className={styles.textareaField}
                                />
                                <textarea
                                    placeholder="General Notes"
                                    value={currentDay.generalNotes || ''}
                                    onChange={e => setCurrentDay(prev => ({ ...prev, generalNotes: e.target.value }))}
                                    className={styles.textareaField}
                                />
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={currentDay.isRestDay || false}
                                            onChange={e => setCurrentDay(prev => ({ ...prev, isRestDay: e.target.checked }))}
                                            className={styles.checkboxInput}
                                        />
                                        Rest Day
                                    </label>
                                </div>
                            </div>

                            {/* Exercise Section */}
                            {!currentDay.isRestDay && (
                                <div className={styles.formSection}>
                                    <div className="flex justify-between items-center">
                                        <h5 className={styles.formSubtitle}>Exercises</h5>
                                        <button
                                            type="button"
                                            onClick={() => setShowExerciseForm(true)}
                                            className={styles.addButton}
                                        >
                                            Add Exercise
                                        </button>
                                    </div>

                                    {/* Exercise List */}
                                    <div className={styles.exerciseList}>
                                        {currentDay.exercises.map((exercise, index) => (
                                            <div key={index} className={styles.exerciseItem}>
                                                <div>
                                                    <span className={styles.exerciseName}>{exercise.name}</span>
                                                    <span className={styles.exerciseDetails}>
                                                        {exercise.sets}x{exercise.reps} @ {exercise.weight}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCurrentDay(prev => ({
                                                            ...prev,
                                                            exercises: prev.exercises.filter((_, i) => i !== index)
                                                        }));
                                                    }}
                                                    className={styles.removeButton}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Exercise Form */}
                                    {showExerciseForm && (
                                        <div className={styles.formSection}>
                                            <div className={styles.formGrid}>
                                                <input
                                                    type="text"
                                                    placeholder="Exercise Name"
                                                    value={currentExercise.name}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Sets"
                                                    value={currentExercise.sets}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Reps"
                                                    value={currentExercise.reps}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Weight (e.g., 80kg, bodyweight)"
                                                    value={currentExercise.weight}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, weight: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Equipment"
                                                    value={currentExercise.equipment}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, equipment: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Target Muscles"
                                                    value={currentExercise.targetMuscles}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, targetMuscles: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Rest Between Sets"
                                                    value={currentExercise.restBetweenSets}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, restBetweenSets: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Tempo (e.g., 3-1-1)"
                                                    value={currentExercise.tempo}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, tempo: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <div className={styles.checkboxGroup}>
                                                    <label className={styles.checkboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={currentExercise.isDropSet}
                                                            onChange={e => setCurrentExercise(prev => ({ ...prev, isDropSet: e.target.checked }))}
                                                            className={styles.checkboxInput}
                                                        />
                                                        Drop Set
                                                    </label>
                                                    <label className={styles.checkboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={currentExercise.isSuperSet}
                                                            onChange={e => setCurrentExercise(prev => ({ ...prev, isSuperSet: e.target.checked }))}
                                                            className={styles.checkboxInput}
                                                        />
                                                        Super Set
                                                    </label>
                                                </div>
                                                {currentExercise.isSuperSet && (
                                                    <input
                                                        type="text"
                                                        placeholder="Super Set Group"
                                                        value={currentExercise.superSetGroup || ''}
                                                        onChange={e => setCurrentExercise(prev => ({ ...prev, superSetGroup: e.target.value }))}
                                                        className={styles.inputField}
                                                    />
                                                )}
                                                <input
                                                    type="text"
                                                    placeholder="Progression Strategy"
                                                    value={currentExercise.progressionStrategy}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, progressionStrategy: e.target.value }))}
                                                    className={styles.inputField}
                                                />
                                                <textarea
                                                    placeholder="Exercise Notes"
                                                    value={currentExercise.notes}
                                                    onChange={e => setCurrentExercise(prev => ({ ...prev, notes: e.target.value }))}
                                                    className={styles.textareaField}
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-4 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowExerciseForm(false)}
                                                    className={styles.btnSecondary}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleAddExercise}
                                                    className={styles.btnPrimary}
                                                >
                                                    Add Exercise
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleAddDay}
                                className={styles.btnSecondary}
                            >
                                Add Day to Week
                            </button>
                        </div>
                    </div>
                    <div className={styles.formNavigation}>
                        <button
                            type="button"
                            onClick={() => setCurrentStep('program')}
                            className={styles.btnSecondary}
                        >
                            Back to Program Details
                        </button>
                        {currentWeek.workoutDays.length > 0 && (
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleAddWeek(true)}
                                    className={styles.btnPrimary}
                                >
                                    Complete & Review Program
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddWeek(false)}
                                    className={styles.btnSecondary}
                                >
                                    Add Another Week
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentStep === 'preview' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Review Program</h3>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.previewSection}>
                            <h4 className={styles.formSubtitle}>Program Overview</h4>
                            <div className={styles.previewContent}>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewLabel}>Name:</span>
                                    <span className={styles.previewValue}>{program.programName}</span>
                                </div>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewLabel}>Duration:</span>
                                    <span className={styles.previewValue}>{program.weeks.length} weeks</span>
                                </div>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewLabel}>Difficulty:</span>
                                    <span className={styles.previewValue}>{program.difficulty}</span>
                                </div>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewLabel}>Goal:</span>
                                    <span className={styles.previewValue}>{program.goal.replace(/_/g, ' ')}</span>
                                </div>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewLabel}>Period:</span>
                                    <span className={styles.previewValue}>
                                        {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {program.weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className={styles.previewSection}>
                                <h4 className={styles.formSubtitle}>
                                    Week {week.weekNumber}
                                    <span className={styles.statusBadge}>
                                        {week.workoutDays.length} days planned
                                    </span>
                                </h4>
                                <div className={styles.previewContent}>
                                    <div className={styles.previewItem}>
                                        <span className={styles.previewLabel}>Goal:</span>
                                        <span className={styles.previewValue}>{week.weeklyGoal}</span>
                                    </div>
                                    {week.workoutDays.map((day, dayIndex) => (
                                        <div key={dayIndex} className={styles.previewItem}>
                                            <div>
                                                <span className={styles.previewLabel}>{day.day}</span>
                                                <div className={styles.previewValue}>
                                                    {day.isRestDay ? (
                                                        <span className={styles.statusBadge}>Rest Day</span>
                                                    ) : (
                                                        <>
                                                            <div>{day.focusArea.replace(/_/g, ' ')}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {day.exercises.length} exercises • {day.duration} mins • {day.intensity} intensity
                                                            </div>
                                                            {day.exercises.map((exercise, exIndex) => (
                                                                <div key={exIndex} className="text-sm text-gray-600 mt-1">
                                                                    {exercise.name}: {exercise.sets}×{exercise.reps} {exercise.weight && `@ ${exercise.weight}`}
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.formNavigation}>
                        <button
                            type="button"
                            onClick={() => setCurrentStep('week')}
                            className={styles.btnSecondary}
                            disabled={isSubmitting || isWorkoutCreated}
                        >
                            Back to Week Plan
                        </button>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={styles.btnPrimary}
                                disabled={isSubmitting || isWorkoutCreated}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Program'}
                            </button>
                            <button
                                type="button"
                                className={`${styles.btnSecondary} ${(!isWorkoutCreated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isWorkoutCreated}
                                onClick={() => {
                                    // Handle navigation to meal plan section
                                    if (onClose) {
                                        onClose();
                                    }
                                    // You can add additional navigation logic here
                                }}
                            >
                                Create Meal Plan →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
} 