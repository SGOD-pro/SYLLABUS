// SYLLABUS - Main Dashboard Page
"use client"
import { useEffect } from 'react';
import { useUserStore, usePanicModeStore, useOnboardingStore } from '@/store';
import { useStudyPlan, useAIInsight } from '@/hooks/useStudyData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FocusZone } from '@/components/dashboard/FocusZone';
import { BrainColumn } from '@/components/dashboard/BrainColumn';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

const Dashboard = () => {
    //   const navigate = useNavigate();
    const router = useRouter()
    const { profile, updateProfile } = useUserStore();
    const { state: onboardingState } = useOnboardingStore();
    const { isPanicMode, setPanicMode } = usePanicModeStore();
    const { fetchPlan } = useStudyPlan();
    const { isLoaded, isSignedIn, getToken } = useAuth();

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !profile) return;

        let isMounted = true;

        const run = async () => {
            try {
                const data = await api<{
                    dailyMinutes: number;
                    fatigueThreshold: number;
                    preferredSlots?: string[];
                    panicMode: boolean;
                }>(API_ROUTES.PROFILE.GET, { getToken });

                if (!isMounted) return;

                const patch: Partial<UserProfile> = {};
                if (typeof data.dailyMinutes === 'number') patch.dailyMinutes = data.dailyMinutes;
                if (typeof data.fatigueThreshold === 'number') patch.fatigueThreshold = data.fatigueThreshold;
                if (Array.isArray(data.preferredSlots)) patch.preferredSlots = data.preferredSlots as TimeSlot[];

                if (Object.keys(patch).length > 0) {
                    updateProfile(patch);
                }

                if (typeof data.panicMode === 'boolean') {
                    setPanicMode(data.panicMode);
                }
            } catch (err) {
                console.log(err);
            }
        };

        run();

        return () => {
            isMounted = false;
        };
    }, [isLoaded, isSignedIn, getToken, profile, updateProfile, setPanicMode]);

    // Redirect to onboarding if not complete
    useEffect(() => {
        if (!profile && !onboardingState.isComplete) {
            router.push('/onboarding');
        }
    }, [profile, onboardingState.isComplete]);

    // Fetch study plan on mount
    useEffect(() => {
        if (profile) {
            fetchPlan();
        }
    }, [profile, fetchPlan]);

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <DashboardHeader />

            {/* Main Content */}
            <main className="container max-w-7xl mx-auto px-4 py-6">
                <div
                    className={cn(
                        'grid grid-cols-1 lg:grid-cols-5 gap-6 transition-all duration-300',
                        isPanicMode && 'rounded-xl p-4 panic-glow'
                    )}
                >
                    {/* Left Column - Focus Zone (60%) */}
                    <div className="lg:col-span-3">
                        <FocusZone />
                    </div>

                    {/* Right Column - The Brain (40%) */}
                    <div className="lg:col-span-2">
                        <BrainColumn />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
