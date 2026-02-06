// Subjects Step - Add subjects with exam dates

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';
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
  const { getToken } = useAuth();
  const [catalogSubjects, setCatalogSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const templateNames = useMemo(() => catalogSubjects.map((t) => t.name), [catalogSubjects]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (templateNames.length === 0) return;
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        isCustom: !templateNames.includes(s.name),
      }))
    );
  }, [templateNames]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoadingCatalog(true);
      try {
        const res = await api<
          Array<{
            id: string;
            name: string;
          }>
        >(API_ROUTES.SUBJECTS.GET, { getToken });

        if (isMounted && Array.isArray(res)) {
          const mapped = res
            .filter((s) => s && typeof s.id === 'string' && typeof s.name === 'string')
            .map((s) => ({ id: s.id, name: s.name }));
          setCatalogSubjects(mapped);
        }
      } catch (err) {
        console.warn('Failed to fetch subjects', err);
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const availableTemplates = templateNames.filter(
    (name) => !subjects.some((s) => s.name === name)
  );

  const addSubjectFromTemplate = () => {
    if (!selectedTemplate) return;
    const catalog = catalogSubjects.find((s) => s.name === selectedTemplate);
    if (!catalog) return;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    setSubjects((prev) => [
      ...prev,
      {
        id: catalog.id,
        name: catalog.name,
        examDate: defaultDate,
        isBacklog: false,
        isCustom: false,
      },
    ]);
    setSelectedTemplate('');
  };

  const addCustomSubject = async () => {
    if (!customSubjectName.trim()) return;

    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    try {
      const created = await api<{
        id: string;
        name: string;
        examDate: string;
        isBacklog: boolean;
      }>(API_ROUTES.SUBJECTS.CREATE, {
        method: 'POST',
        body: {
          name: customSubjectName.trim(),
          examDate: defaultDate.toISOString(),
          isBacklog: false,
          priorityWeight: 1.0,
        },
        getToken,
      });

      if (created?.id && created?.name) {
        setSubjects((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            examDate: new Date(created.examDate),
            isBacklog: Boolean(created.isBacklog),
            isCustom: true,
          },
        ]);
        setCustomSubjectName('');
        setShowCustomInput(false);
      }
    } catch (err) {
      console.warn('Failed to create subject', err);
    }
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, updates: Partial<SubjectEntry>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const fullSubjects: Subject[] = await Promise.all(
      subjects.map(async (entry) => {
        const priorityWeight = entry.isBacklog ? 1.5 : 1.0;
        let concepts: Concept[] = [];
        try {
          const conceptsRes = await api<any[]>(
            API_ROUTES.CONCEPTS.BY_SUBJECT(entry.id),
            { getToken }
          );
          if (Array.isArray(conceptsRes)) {
            concepts = conceptsRes
              .filter(
                (c) =>
                  c &&
                  typeof c.id === 'string' &&
                  typeof c.name === 'string' &&
                  typeof c.difficulty === 'number' &&
                  typeof c.estimatedMinutes === 'number'
              )
              .map((c) => ({
                id: c.id,
                name: c.name,
                difficulty: c.difficulty,
                estimatedMinutes: c.estimatedMinutes,
                isHighWeight: typeof c.isHighWeight === 'boolean' ? c.isHighWeight : false,
                subjectId: entry.id,
                prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
              }));
          }
        } catch (err) {
          console.warn('Failed to fetch concepts', err);
        }

        return {
          id: entry.id,
          name: entry.name,
          examDate: entry.examDate,
          isBacklog: entry.isBacklog,
          creditWeight: 4,
          concepts,
          priorityWeight,
        };
      })
    );

    setIsSubmitting(false);
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
              disabled={!selectedTemplate || isLoadingCatalog}
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
            disabled={subjects.length === 0 || isSubmitting}
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
