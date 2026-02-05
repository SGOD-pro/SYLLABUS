// Step Indicator Component

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Profile', 'Subjects', 'Schedule'];

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground border-primary',
                  isCurrent && 'border-primary text-primary bg-primary/10',
                  !isCompleted && !isCurrent && 'border-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {stepLabels[step - 1]}
              </span>
            </div>

            {/* Connector Line */}
            {step < totalSteps && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2 mb-5',
                  step < currentStep ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
