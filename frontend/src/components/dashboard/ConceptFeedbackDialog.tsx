import { useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FeedbackType =
  | 'CONFUSING'
  | 'TOO_FAST'
  | 'TOO_EASY'
  | 'NEED_MORE_PRACTICE'
  | 'CLEAR'
  | 'CONFIDENT';

const FEEDBACK_OPTIONS: Array<{ value: FeedbackType; label: string }> = [
  { value: 'CONFUSING', label: 'Confusing' },
  { value: 'TOO_FAST', label: 'Too Fast' },
  { value: 'TOO_EASY', label: 'Too Easy' },
  { value: 'NEED_MORE_PRACTICE', label: 'Need More Practice' },
  { value: 'CLEAR', label: 'Clear' },
  { value: 'CONFIDENT', label: 'Confident' },
];

interface ConceptFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conceptId?: string | null;
  conceptName?: string | null;
  sessionId?: string | null;
}

export const ConceptFeedbackDialog = ({
  isOpen,
  onClose,
  conceptId,
  conceptName,
  sessionId,
}: ConceptFeedbackDialogProps) => {
  const { getToken } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType | ''>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(conceptId && feedbackType);
  }, [conceptId, feedbackType]);

  const handleSubmit = async () => {
    if (!canSubmit || !conceptId) return;
    setIsSubmitting(true);
    try {
      await api(API_ROUTES.FEEDBACK.CONCEPT, {
        method: 'POST',
        body: {
          conceptId,
          feedbackType,
          note: note.trim() ? note.trim() : null,
          sessionId: sessionId ?? null,
        },
        getToken,
      });
      toast('Feedback sent.');
      setFeedbackType('');
      setNote('');
      onClose();
    } catch {
      // api client already toasts errors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Concept Feedback</DialogTitle>
          <DialogDescription>
            {conceptName ? `For ${conceptName}` : 'Share quick feedback'}
          </DialogDescription>
        </DialogHeader>

        {!conceptId ? (
          <p className="text-sm text-muted-foreground">
            No active session to attach feedback.
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Feedback type</Label>
              <Select
                value={feedbackType}
                onValueChange={(value) => setFeedbackType(value as FeedbackType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Add a short note"
              />
              <div className="text-xs text-muted-foreground text-right">
                {note.length}/300
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
