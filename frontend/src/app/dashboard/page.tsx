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

const Dashboard = () => {
    //   const navigate = useNavigate();
    const router = useRouter()
    const { profile } = useUserStore();
    const { state: onboardingState } = useOnboardingStore();
    const { isPanicMode } = usePanicModeStore();
    const { fetchPlan } = useStudyPlan();

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
