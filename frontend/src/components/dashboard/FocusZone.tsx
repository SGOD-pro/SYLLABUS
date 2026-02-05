// Focus Zone - Today's Study Path

import { useState } from 'react';
import { useStudyPlan, usePanicMode } from '@/hooks/useStudyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SessionCard } from '@/components/dashboard/SessionCard';
import { FeedbackModal } from '@/components/dashboard/FeedbackModal';
// import { StudySession } from '@/types';
import { Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FocusZone = () => {
  const { 
    sessions, 
    isLoading, 
    isRecalculating,
    completedCount, 
    totalCount, 
    progressPercent,
    recalculatePlan 
  } = useStudyPlan();
  const { isPanicMode } = usePanicMode();

  const [feedbackSession, setFeedbackSession] = useState<StudySession | null>(null);

  const handleSessionStart = (session: StudySession) => {
    setFeedbackSession(session);
  };

  const handleFeedbackClose = () => {
    setFeedbackSession(null);
  };

  const handleFeedbackSubmit = async () => {
    await recalculatePlan();
    setFeedbackSession(null);
  };

  return (
    <>
      <Card className={cn(
        'border shadow-none',
        isPanicMode && 'border-panic'
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Target className="w-5 h-5 text-foreground" />
              Today's Study Path
            </CardTitle>
            <span className="text-sm text-muted/60">
              {completedCount} / {totalCount} completed
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="pt-2">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-foreground" />
              <span className="ml-2 text-muted-foreground">Loading your plan...</span>
            </div>
          )}

          {/* Recalculating State */}
          {isRecalculating && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mb-3" />
                <p className="font-medium">Re-calculating your path...</p>
                <p className="text-sm text-muted-foreground">
                  Optimizing based on your feedback
                </p>
              </div>
            </div>
          )}

          {!isLoading && !isRecalculating && sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  index={index + 1}
                  onStart={() => handleSessionStart(session)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isRecalculating && sessions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-foreground" />
              </div>
              <p className="font-medium mb-1">All caught up!</p>
              <p className="text-sm text-muted-foreground">
                {isPanicMode 
                  ? "No high-priority topics left. You're ready!"
                  : "Add subjects in settings to generate a study plan."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <FeedbackModal
        session={feedbackSession}
        isOpen={!!feedbackSession}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};
