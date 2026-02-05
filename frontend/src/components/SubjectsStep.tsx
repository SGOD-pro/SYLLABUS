// Subjects Step - Add subjects with exam dates

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { Degree, Subject } from '@/types';
import { getSubjectsForDegree, createSubjectFromTemplate } from '@/data/subjects';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Calendar as CalendarIcon,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubjectsStepProps {
  degree: Degree;
  defaultSubjects?: Subject[];
  onSubmit: (subjects: Subject[]) => void;
  onBack: () => void;
}

interface SubjectEntry {
  id: string;
  name: string;
  examDate: Date;
  isBacklog: boolean;
  isCustom: boolean;
}

export const SubjectsStep = ({ degree, defaultSubjects, onSubmit, onBack }: SubjectsStepProps) => {
  const templates = useMemo(() => getSubjectsForDegree(degree), [degree]);
  const templateNames = useMemo(() => templates.map((t) => t.name), [templates]);

  const [subjects, setSubjects] = useState<SubjectEntry[]>(() => {
    if (defaultSubjects?.length) {
      return defaultSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        examDate: new Date(s.examDate),
        isBacklog: s.isBacklog,
        isCustom: !templateNames.includes(s.name),
      }));
    }
    return [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const availableTemplates = templateNames.filter(
    (name) => !subjects.some((s) => s.name === name)
  );

  const addSubjectFromTemplate = () => {
    if (!selectedTemplate) return;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    setSubjects((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: selectedTemplate,
        examDate: defaultDate,
        isBacklog: false,
        isCustom: false,
      },
    ]);
    setSelectedTemplate('');
  };

  const addCustomSubject = () => {
    if (!customSubjectName.trim()) return;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    setSubjects((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: customSubjectName.trim(),
        examDate: defaultDate,
        isBacklog: false,
        isCustom: true,
      },
    ]);
    setCustomSubjectName('');
    setShowCustomInput(false);
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, updates: Partial<SubjectEntry>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleSubmit = () => {
    const fullSubjects: Subject[] = subjects.map((entry) => {
      const template = templates.find((t) => t.name === entry.name);
      // Calculate priorityWeight based on backlog status (KT = 1.5, normal = 1.0)
      const priorityWeight = entry.isBacklog ? 1.5 : 1.0;

      if (template) {
        const subject = createSubjectFromTemplate(template, entry.examDate);
        subject.id = entry.id;
        subject.isBacklog = entry.isBacklog;
        (subject as any).priorityWeight = priorityWeight;
        return subject;
      }
      // Custom subject without predefined concepts
      return {
        id: entry.id,
        name: entry.name,
        examDate: entry.examDate,
        isBacklog: entry.isBacklog,
        creditWeight: 4,
        concepts: [],
        priorityWeight,
      };
    });

    onSubmit(fullSubjects);
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <BookOpen className="w-5 h-5 text-foreground" />
          Add your subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add from templates */}
        <div className="space-y-3">
          <Label>Select from {degree} subjects</Label>
          <div className="flex gap-2">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addSubjectFromTemplate}
              disabled={!selectedTemplate}
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add custom subject */}
        <div className="space-y-3">
          {!showCustomInput ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCustomInput(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Subject
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter subject name"
                value={customSubjectName}
                onChange={(e) => setCustomSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
              />
              <Button onClick={addCustomSubject} disabled={!customSubjectName.trim()}>
                Add
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowCustomInput(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Subject List */}
        {subjects.length > 0 && (
          <div className="space-y-3">
            <Label>Your subjects ({subjects.length})</Label>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {subject.name}
                      </span>
                      {subject.isCustom && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                      {subject.isBacklog && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Backlog
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Exam Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {format(subject.examDate, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={subject.examDate}
                        onSelect={(date: any) =>
                          date && updateSubject(subject.id, { examDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Backlog Toggle */}
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={subject.isBacklog}
                      onCheckedChange={(checked) =>
                        updateSubject(subject.id, { isBacklog: checked })
                      }
                    />
                    <span className="text-xs text-muted-foreground">KT</span>
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSubject(subject.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {subjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No subjects added yet</p>
            <p className="text-sm">Select from the list or add custom subjects</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={subjects.length === 0}
            className="flex-1"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
