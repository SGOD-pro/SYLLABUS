// Feedback Modal Component

import { useState, useEffect } from 'react';
import { useSessionFeedback } from '@/hooks/useStudyData';
// import { StudySession } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

const difficultyEmojis = [
  { value: 1, emoji: '😊', label: 'Very Easy' },
  { value: 2, emoji: '🙂', label: 'Easy' },
  { value: 3, emoji: '😐', label: 'Moderate' },
  { value: 4, emoji: '😓', label: 'Hard' },
  { value: 5, emoji: '😰', label: 'Very Hard' },
];

export const FeedbackModal = ({ session, isOpen, onClose, onSubmit }: FeedbackModalProps) => {
  const { submitFeedback, isSubmitting } = useSessionFeedback();

  const [actualMinutes, setActualMinutes] = useState(session?.plannedMinutes || 30);
  const [completionScore, setCompletionScore] = useState(1.0); // 0.0 to 1.0
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!session) return;

    // Submit with API-aligned field names
    await submitFeedback(session.id,session.conceptId, {
      actualMinutes,
      completionPercent: Math.round(completionScore * 100),
      difficultyRating, // This maps to difficultyFeedback in API
      notes: notes.trim() || undefined,
    });

    // Reset form
    setActualMinutes(30);
    setCompletionScore(1.0);
    setDifficultyRating(3);
    setNotes('');

    await onSubmit();
  };

  // Update defaults when session changes  
  useEffect(() => {
    if (session) {
      setActualMinutes(session.plannedMinutes);
      setCompletionScore(1.0);
      setDifficultyRating(3);
      setNotes('');
    }
  }, [session]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Complete</DialogTitle>
          <DialogDescription>
            {session?.concept.name} — How did it go?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Actual Time Spent */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Time spent</Label>
              <span className="text-lg font-semibold text-foreground">{actualMinutes} mins</span>
            </div>
            <Slider
              value={[actualMinutes]}
              onValueChange={([value]) => setActualMinutes(value)}
              min={5}
              max={120}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 mins</span>
              <span>Planned: {session?.plannedMinutes} mins</span>
              <span>120 mins</span>
            </div>
          </div>

          {/* Completion Score (0.0 to 1.0) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>How much did you complete?</Label>
              <span className="text-lg font-semibold text-foreground">{Math.round(completionScore * 100)}%</span>
            </div>
            <Slider
              value={[completionScore * 100]}
              onValueChange={([value]) => setCompletionScore(value / 100)}
              min={0}
              max={100}
              step={10}
            />
          </div>

          {/* Difficulty Rating (1-5 scale for difficultyFeedback) */}
          <div className="space-y-3">
            <Label>How difficult was it?</Label>
            <div className="flex justify-between">
              {difficultyEmojis.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficultyRating(value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                    difficultyRating === value
                      ? 'bg-foreground/10 scale-110'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className={cn(
                    'text-xs',
                    difficultyRating === value ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any thoughts or blockers?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Session'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
