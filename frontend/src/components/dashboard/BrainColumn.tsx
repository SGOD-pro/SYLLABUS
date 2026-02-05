// Brain Column - AI Insights, Resources, Syllabus Parser

import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { ResourceSidebar } from '@/components/dashboard/ResourceSidebar';
import { SyllabusParser } from '@/components/dashboard/SyllabusParser';

export const BrainColumn = () => {
  return (
    <div className="space-y-4">
      {/* AI Insight */}
      <AIInsightCard />

      {/* Resources */}
      <ResourceSidebar />

      {/* Syllabus Parser */}
      <SyllabusParser />
    </div>
  );
};
