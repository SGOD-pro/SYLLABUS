// SYLLABUS - Landing Page
"use client"
import { useEffect } from 'react';
import { useOnboardingStore, useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Target,
  Brain,
  AlertTriangle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: Target,
    title: 'Smart Planning',
    description: 'AI-powered study schedules that adapt to your pace and learning style.',
  },
  {
    icon: Brain,
    title: 'Concept Dependencies',
    description: 'Never study out of order. Prerequisites are always handled first.',
  },
  {
    icon: AlertTriangle,
    title: 'Panic Mode',
    description: 'Exam tomorrow? Focus only on high-weightage topics instantly.',
  },
];

const Index = () => {
  // const navigate = useNavigate();
  const router = useRouter()
  const { state } = useOnboardingStore();
  const { profile } = useUserStore();

  // Auto-redirect if already set up
  useEffect(() => {
    if (profile || state.isComplete) {
      router.push('/dashboard');
    }
  }, [profile, state.isComplete]);

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-foreground" />
            <span className="font-semibold text-lg">SYLLABUS</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Study Smarter,
            <br />
            <span className="text-foreground">Not Harder</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            An adaptive study planner designed for Indian engineering students.
            No more last-minute panic. No more missed prerequisites.
          </p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} className="gap-2">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className=" bg-foreground">
              <CardContent className="pt-6 text-background">
                <feature.icon className="w-10 h-10 text-background mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className=" rounded-xl p-8 border text-foreground">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Built for Indian Engineering Students
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Pre-loaded B.Tech, M.Tech, MSc, BSc subjects',
              'Track backlog/KT subjects separately',
              'NPTEL, Abdul Bari, Gate Smashers resources',
              'Upload syllabus PDF for instant topic extraction',
              'Exam-focused panic mode',
              'Completely free and offline-ready',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-foreground shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            SYLLABUS — Your senior student's desk, digitized.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
