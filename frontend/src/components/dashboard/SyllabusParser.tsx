// Syllabus Parser Component

import { useCallback, useState } from 'react';
import { useSyllabusParser } from '@/hooks/useStudyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  FileText, 
  Loader2, 
  Check, 
  X,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SyllabusParser = () => {
  const { file, extractedTopics, isParsing, parseFile, confirmTopics: confirmTopicsAPI, clearParser } = useSyllabusParser();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      parseFile(uploadedFile);
      setSelectedTopics(new Set());
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const uploadedFile = e.dataTransfer.files?.[0];
    if (uploadedFile && (uploadedFile.type === 'application/pdf' || uploadedFile.type.startsWith('image/'))) {
      parseFile(uploadedFile);
      setSelectedTopics(new Set());
    }
  }, [parseFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedTopics(new Set(extractedTopics.map(t => t.id)));
  };

  const confirmTopics = async () => {
    setIsConfirming(true);
    try {
      await confirmTopicsAPI(Array.from(selectedTopics));
      clearParser();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Sparkles className="w-5 h-5 text-foreground" />
          Syllabus Parser
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Upload Zone */}
        {!file && !isParsing && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              isDragOver 
                ? 'border-foreground bg-foreground/5' 
                : 'border-border hover:border-foreground/50'
            )}
          >
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
              id="syllabus-upload"
            />
            <label htmlFor="syllabus-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload Syllabus</p>
              <p className="text-xs text-muted-foreground">
                PDF or Image • Drag & drop or click
              </p>
            </label>
          </div>
        )}

        {/* Parsing State */}
        {isParsing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing {file?.name}...</span>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-5/6" />
            </div>
          </div>
        )}

        {/* Extracted Topics */}
        {!isParsing && extractedTopics.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-foreground" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearParser}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedTopics.size} of {extractedTopics.length} selected
              </span>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={selectAll}>
                Select all
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {extractedTopics.map((topic) => (
                <label
                  key={topic.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTopics.has(topic.id)}
                    onCheckedChange={() => toggleTopic(topic.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm">{topic.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({topic.estimatedMinutes} mins)
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={confirmTopics}
              disabled={selectedTopics.size === 0 || isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Add {selectedTopics.size} Topics to Plan
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
