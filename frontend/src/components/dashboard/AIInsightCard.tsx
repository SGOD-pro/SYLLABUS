// AI Insight Card Component

import { useAIInsight, usePanicMode } from '@/hooks/useStudyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AIInsightCard = () => {
  const { insight, isThinking, fetchInsight } = useAIInsight();
  const { isPanicMode } = usePanicMode();

  return (
    <Card className={cn(
      'border shadow-none',
      isPanicMode
        ? 'bg-panic/10 border-panic/30'
        : 'bg-muted text-accent-foreground'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-background font-medium">
            {isPanicMode ? (
              <AlertTriangle className="w-5 h-5 text-panic" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
            {isPanicMode ? 'Emergency Plan' : 'Why this plan?'}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchInsight()}
            disabled={isThinking}
          >
            <RefreshCw className={cn('w-4 h-4', isThinking && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isThinking ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-accent-foreground/80" />
            <Skeleton className="h-4 w-4/5 bg-accent-foreground/80" />
            <Skeleton className="h-4 w-3/5 bg-accent-foreground/80" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight?.explanationText || 'Loading insights...'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
