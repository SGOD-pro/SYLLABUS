// Dashboard Header Component

import { format } from 'date-fns';
import { useState } from 'react';
import { useUserStore, usePanicModeStore } from '@/store';
import { usePanicMode, useStudyPlan } from '@/hooks/useStudyData';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AlertTriangle, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConceptFeedbackDialog } from '@/components/dashboard/ConceptFeedbackDialog';

export const DashboardHeader = () => {
  const { profile } = useUserStore();
  const { isPanicMode, togglePanicMode } = usePanicMode();
  const { sessions } = useStudyPlan();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const currentSession = sessions?.[0];
  const currentConceptId = currentSession?.conceptId ?? null;
  const currentConceptName = currentSession?.concept?.name ?? null;
  const currentSessionId = currentSession?.id ?? null;

  const today = new Date();
  const initials = profile?.branch
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  return (
    <header className="border-b bg-card">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo & Date */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-foreground" />
              <span className="font-semibold text-lg">SYLLABUS</span>
            </div>
            <div className="hidden sm:block text-sm text-foreground/75">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>

          {/* Center - Panic Mode (if active) */}
          {isPanicMode && (
            <Badge 
              variant="destructive" 
              className="bg-panic text-panic-foreground flex items-center gap-1.5 animate-pulse-subtle"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              PANIC MODE ACTIVE
            </Badge>
          )}

          {/* Right - Theme Toggle, Panic Toggle & Profile */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Feedback */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFeedbackOpen(true)}
              disabled={!currentConceptId}
              className="hidden sm:inline-flex"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </Button>

            {/* Panic Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-medium transition-colors',
                isPanicMode ? 'text-panic' : 'text-foreground'
              )}>
                Panic Mode
              </span>
              <Switch
                checked={isPanicMode}
                onCheckedChange={togglePanicMode}
                className={cn(
                  isPanicMode && 'data-[state=checked]:bg-panic'
                )}
              />
            </div>

            {/* User Avatar */}
            <Avatar className="h-9 w-9 border">
              <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <ConceptFeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        conceptId={currentConceptId}
        conceptName={currentConceptName}
        sessionId={currentSessionId}
      />
    </header>
  );
};
