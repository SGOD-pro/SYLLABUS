// Profile Step - Degree, Semester, Branch selection

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Degree } from '@/types';
import { GraduationCap, ArrowRight } from 'lucide-react';

interface ProfileStepProps {
  defaultValues?: {
    degree?: Degree;
    semester?: number;
    branch?: string;
  };
  onSubmit: (data: { degree: Degree; semester: number; branch: string }) => void;
}

const degrees: Degree[] = ['B.Tech', 'M.Tech', 'MSc', 'BSc'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export const ProfileStep = ({ defaultValues, onSubmit }: ProfileStepProps) => {
  const [degree, setDegree] = useState<Degree | undefined>(defaultValues?.degree);
  const [semester, setSemester] = useState<number | undefined>(defaultValues?.semester);
  const [branch, setBranch] = useState(defaultValues?.branch || '');

  const isValid = degree && semester && branch.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit({ degree: degree!, semester: semester!, branch: branch.trim() });
    }
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <GraduationCap className="w-5 h-5 text-foreground" />
          Tell us about your program
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Degree Selection */}
          <div className="space-y-2">
            <Label htmlFor="degree">Degree Program</Label>
            <Select value={degree} onValueChange={(v) => setDegree(v as Degree)} >
              <SelectTrigger id="degree" className='w-full'>
                <SelectValue placeholder="Select your degree" />
              </SelectTrigger>
              <SelectContent>
                {degrees.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <Label htmlFor="semester">Current Semester</Label>
            <Select
              value={semester?.toString()}
              onValueChange={(v) => setSemester(parseInt(v))}
            >
              <SelectTrigger id="semester" className='w-full'>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch Input */}
          <div className="space-y-2">
            <Label htmlFor="branch">Branch / Specialization</Label>
            <Input
              id="branch"
              placeholder="e.g., Computer Science, Electronics, Physics"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={!isValid}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
