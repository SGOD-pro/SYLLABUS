// SYLLABUS - Onboarding Page
// Multi-step wizard for profile, subjects, and study constraints
"use client"
import { useEffect, useState } from 'react';
import { useOnboardingStore, useUserStore } from '@/store';
import { StepIndicator } from '@/components/StepIndicator';
import { ProfileStep } from '@/components/ProfileStep';
import { SubjectsStep } from '@/components/SubjectsStep';
import { ConstraintsStep } from '@/components/ConstraintsStep';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const Onboarding = () => {
    //   const navigate = useNavigate();
    const router = useRouter()
    const { state, setStep, updateProfile, completeOnboarding } = useOnboardingStore();
    const { setProfile } = useUserStore();

    const [localSubjects, setLocalSubjects] = useState<Subject[]>([]);

    const handleProfileSubmit = (data: { degree: Degree; semester: number; branch: string }) => {
        updateProfile(data);
        setStep(2);
    };

    const handleSubjectsSubmit = (subjects: Subject[]) => {
        setLocalSubjects(subjects);
        updateProfile({ subjects });
        setStep(3);
    };

    const handleConstraintsSubmit = (data: {
        dailyHours: number;
        dailyMinutes: number;
        fatigueThreshold: number;
        preferredSlots: TimeSlot[];
        daysOff: number[]
    }) => {
        const fullProfile: UserProfile = {
            id: uuidv4(),
            degree: state.profile.degree as Degree,
            semester: state.profile.semester as number,
            branch: state.profile.branch as string,
            dailyHours: data.dailyHours,
            dailyMinutes: data.dailyMinutes,
            fatigueThreshold: data.fatigueThreshold,
            preferredSlots: data.preferredSlots,
            daysOff: data.daysOff,
            subjects: localSubjects,
            createdAt: new Date(),
        };

        setProfile(fullProfile);
        completeOnboarding();
        router.push('/dashboard');
    };

    const handleBack = () => {
        if (state.step > 1) {
            setStep(state.step - 1);
        }
    };

    // Redirect if already completed
    useEffect(() => {
        if (state.isComplete) {
             router.push('/dashboard');
        }
    }, [state.isComplete]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-2xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-foreground mb-2">
                        Welcome to SYLLABUS
                    </h1>
                    <p className="text-muted-foreground">
                        Let's set up your personalized study plan
                    </p>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={state.step} totalSteps={3} />

                {/* Step Content */}
                <div className="mt-8">
                    {state.step === 1 && (
                        <ProfileStep
                            defaultValues={state.profile}
                            onSubmit={handleProfileSubmit}
                        />
                    )}

                    {state.step === 2 && (
                        <SubjectsStep
                            degree={state.profile.degree as Degree}
                            defaultSubjects={localSubjects}
                            onSubmit={handleSubjectsSubmit}
                            onBack={handleBack}
                        />
                    )}

                    {state.step === 3 && (
                        <ConstraintsStep
                            defaultValues={{
                                dailyHours: state.profile.dailyHours || 4,
                                preferredSlots: state.profile.preferredSlots || [],
                                daysOff: state.profile.daysOff || [],
                            }}
                            onSubmit={handleConstraintsSubmit}
                            onBack={handleBack}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
