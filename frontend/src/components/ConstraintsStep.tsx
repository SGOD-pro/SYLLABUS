// Constraints Step - Daily hours, time slots, days off
"use client"
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
// import { TimeSlot } from '@/types';
import { Clock, ArrowLeft, Check, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConstraintsStepProps {
  defaultValues?: {
    dailyHours: number;
    preferredSlots: TimeSlot[];
    daysOff: number[];
  };
  onSubmit: (data: { 
    dailyHours: number; 
    dailyMinutes: number;
    fatigueThreshold: number;
    preferredSlots: TimeSlot[]; 
    daysOff: number[] 
  }) => void;
  onBack: () => void;
}

const timeSlots: { value: TimeSlot; label: string; icon: typeof Sun; time: string }[] = [
  { value: 'morning', label: 'Morning', icon: Sun, time: '6 AM - 12 PM' },
  { value: 'afternoon', label: 'Afternoon', icon: Coffee, time: '12 PM - 5 PM' },
  { value: 'evening', label: 'Evening', icon: Sunset, time: '5 PM - 9 PM' },
  { value: 'night', label: 'Night', icon: Moon, time: '9 PM - 12 AM' },
];

const weekDays = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const ConstraintsStep = ({ defaultValues, onSubmit, onBack }: ConstraintsStepProps) => {
  const [dailyHours, setDailyHours] = useState(defaultValues?.dailyHours || 4);
  const [preferredSlots, setPreferredSlots] = useState<TimeSlot[]>(
    defaultValues?.preferredSlots || []
  );
  const [daysOff, setDaysOff] = useState<number[]>(defaultValues?.daysOff || [0]); // Sunday by default

  const toggleSlot = (slot: TimeSlot) => {
    setPreferredSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const toggleDayOff = (day: number) => {
    setDaysOff((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    // Calculate fatigueThreshold based on daily hours
    // 1-3h = 2, 4-6h = 3, 7h+ = 4
    const fatigueThreshold = dailyHours <= 3 ? 2 : dailyHours <= 6 ? 3 : 4;
    const dailyMinutes = dailyHours * 60;

    onSubmit({
      dailyHours,
      dailyMinutes,
      fatigueThreshold,
      preferredSlots: preferredSlots.length > 0 ? preferredSlots : ['morning', 'evening'],
      daysOff,
    });
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Clock className="w-5 h-5 text-foreground" />
          Set your study schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Daily Study Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily study hours</Label>
            <span className="text-2xl font-semibold text-foreground">{dailyHours}h</span>
          </div>
          <Slider
            value={[dailyHours]}
            onValueChange={([value]) => setDailyHours(value)}
            min={1}
            max={12}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 hour</span>
            <span>12 hours</span>
          </div>
        </div>

        {/* Preferred Time Slots */}
        <div className="space-y-3">
          <Label>Preferred study times</Label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map(({ value, label, icon: Icon, time }) => {
              const isSelected = preferredSlots.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSlot(value)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                    isSelected
                      ? 'border-foreground bg-foreground/5 text-foreground'
                      : 'border-border hover:border-foreground/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-foreground ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Select all that apply. We'll schedule sessions during these times.
          </p>
        </div>

        {/* Days Off */}
        <div className="space-y-3">
          <Label>Days off (no study sessions)</Label>
          <div className="flex gap-2">
            {weekDays.map(({ value, label }) => {
              const isOff = daysOff.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDayOff(value)}
                  className={cn(
                    'w-10 h-10 rounded-full text-sm font-medium transition-colors border',
                    isOff
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/50'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-1">
          <p className="text-sm font-medium">Your study summary</p>
          <p className="text-sm text-muted-foreground">
            {dailyHours} hours/day • {7 - daysOff.length} days/week •{' '}
            {((dailyHours * (7 - daysOff.length))).toFixed(0)} hours/week
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Complete Setup
            <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
