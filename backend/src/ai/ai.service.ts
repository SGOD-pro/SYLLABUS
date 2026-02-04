import { Injectable } from '@nestjs/common';
import {
  buildExplainabilityGraph,
  // type ExplainabilityInput,
  // type ExplainabilityOutput,
} from './explainability.graph';
import { LlmFactory } from './llm.factory';
import { buildSyllabusGraph } from './syllabus.graph';
export interface ExplainabilityInput {
  yesterdayPlan: any | null;
  todayPlan: any;
  profile: {
    dailyMinutes: number;
    panicMode: boolean;
  };
  recentSessions: {
    conceptId: string;
    completionScore: number;
    difficultyFeedback: number;
  }[];
}
@Injectable()
export class AiService {
  constructor(private readonly llmFactory: LlmFactory) { }

  async explainPlan(input: ExplainabilityInput){
    const graph = buildExplainabilityGraph(this.llmFactory);
    const result = await graph.invoke(input);

    return {
      explanationText: result.explanationText,
    };
  }

  async parseSyllabus(rawText: string) {
    const graph = buildSyllabusGraph();
    const result = await graph.invoke({ rawText });

    return {
      extractedTopics: result.extractedTopics ?? [],
      structuredConcepts: result.structuredConcepts ?? [],
      needsConfirmation: result.needsConfirmation ?? true,
    };
  }
}
