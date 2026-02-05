// Session Card Component

// import { StudySession } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, Play, Check, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCardProps {
    session: StudySession;
    index: number;
    onStart: () => void;
}

export const SessionCard = ({ session, index, onStart }: SessionCardProps) => {
    const { concept, status, prerequisitesMet, plannedMinutes } = session;
    const isLocked = !prerequisitesMet;
    const isCompleted = status === 'completed';
    const isSkipped = status === 'skipped';

    const getDifficultyLabel = (difficulty: number) => {
        const labels = ['Easy', 'Medium', 'Moderate', 'Hard', 'Very Hard'];
        return labels[difficulty - 1] || 'Medium';
    };

    return (
        <div
            className={cn(
                'flex items-center gap-4 p-4 rounded-lg border transition-all',
                isLocked && 'bg-muted border-0',
                isCompleted && 'bg-muted/30 border-0',
                isSkipped && 'bg-muted/30',
                !isLocked && !isCompleted && !isSkipped && 'bg-card hover:border-foreground/50'
            )}
        >
            {/* Order Number */}
            <div
                className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                    isCompleted
                        ? 'bg-foreground text-background'
                        : isLocked
                            ? 'bg-background text-foreground'
                            : 'bg-foreground/10 text-foreground'
                )}
            >
                {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : index}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                        'font-medium text-foreground truncate',
                        isCompleted && 'line-through text-background/75', isLocked && "text-background/75"
                    )}>
                        {concept.name}
                    </span>
                    {concept.isHighWeight && (
                        <Badge variant="outline" className="text-xs shrink-0 bg-background">
                            High Priority
                        </Badge>
                    )}
                </div>

                <div className={cn("flex items-center gap-3 text-sm text-foreground", isLocked && "text-muted-foreground")}>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {plannedMinutes} mins
                    </span>
                    <Badge className={cn("text-xs", isLocked&&"border border-background bg-muted")}>
                        {getDifficultyLabel(concept.difficulty)}
                    </Badge>
                </div>

                {isLocked && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Complete previous session first
                    </p>
                )}
            </div>

            {/* Action Button */}
            {!isCompleted && !isSkipped && (
                <Button
                    size="sm"
                    variant={isLocked ? 'ghost' : 'secondary'}
                    disabled={isLocked}
                    onClick={onStart}
                    className="shrink-0"
                >
                    {isLocked ? (
                        <Lock className="w-4 h-4" />
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                        </>
                    )}
                </Button>
            )}

            {isCompleted && (
                <Badge >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Done
                </Badge>
            )}

            {isSkipped && (
                <Badge variant="outline" className="text-muted-foreground">
                    <SkipForward className="w-3.5 h-3.5 mr-1" />
                    Skipped
                </Badge>
            )}
        </div>
    );
};
