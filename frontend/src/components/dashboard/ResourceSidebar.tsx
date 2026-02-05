// Resource Sidebar Component

import { useResources, useStudyPlan, usePanicMode } from '@/hooks/useStudyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Video, FileText, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
// import { ResourcePlatform } from '@/types';

const platformConfig: Record<ResourcePlatform, { icon: typeof Video }> = {
  NPTEL: { icon: BookOpen },
  YouTube: { icon: Video },
  PDF: { icon: FileText },
  Website: { icon: Globe },
};

export const ResourceSidebar = () => {
  const { sessions } = useStudyPlan();
  const { isPanicMode } = usePanicMode();
  
  // Get the first pending session's concept for resources
  const currentSession = sessions.find(s => s.status === 'pending' && s.prerequisitesMet);
  const conceptName = currentSession?.concept.name;
  
  const { resources, isLoading } = useResources(conceptName);

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BookOpen className="w-5 h-5 text-foreground" />
          Quick Resources
          {isPanicMode && (
            <Badge variant="secondary" className="bg-panic/10 text-panic text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Quick Rev
            </Badge>
          )}
        </CardTitle>
        {conceptName && (
          <p className="text-sm text-muted-foreground">
            For: {conceptName}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Loading resources...
          </div>
        ) : resources.length > 0 ? (
          resources.map((resource) => {
            const config = platformConfig[resource.platform];
            const Icon = config.icon;

            return (
              <Link
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:border-background hover:bg-muted hover:text-muted-foreground transition-colors group"
              >
                <Badge variant="outline" className="shrink-0 group-hover:border-background group-hover:text-background">
                  <Icon className="w-3.5 h-3.5" />
                </Badge>
                <span className="text-sm flex-1 truncate">{resource.title}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            {conceptName 
              ? 'No resources available for this topic'
              : 'Start a session to see relevant resources'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};
