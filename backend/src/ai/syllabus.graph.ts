import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

const SyllabusState = Annotation.Root({
  rawText: Annotation<string>(),
  extractedTopics: Annotation<string[]>(),
  structuredConcepts: Annotation<
    { name: string; prerequisites: string[] }[]
  >(),
  needsConfirmation: Annotation<boolean>(),
});

function splitTopics(rawText: string): string[] {
  const parts = rawText
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts;
}

function cleanTopics(topics: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const topic of topics) {
    const key = topic.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(topic);
    }
  }
  return cleaned;
}

export function buildSyllabusGraph() {
  const graph = new StateGraph(SyllabusState)
    .addNode('vision_extract', async (state) => {
      return {
        ...state,
        extractedTopics: splitTopics(state.rawText ?? ''),
      };
    })
    .addNode('topic_cleaning', async (state) => {
      return {
        ...state,
        extractedTopics: cleanTopics(state.extractedTopics ?? []),
      };
    })
    .addNode('concept_structuring', async (state) => {
      return {
        ...state,
        structuredConcepts: (state.extractedTopics ?? []).map((topic) => ({
          name: topic,
          prerequisites: [],
        })),
      };
    })
    .addNode('prerequisite_hinting', async (state) => {
      return {
        ...state,
        structuredConcepts: (state.structuredConcepts ?? []).map((concept) => ({
          ...concept,
          prerequisites: [],
        })),
      };
    })
    .addNode('final_state', async (state) => {
      return {
        ...state,
        needsConfirmation: true,
      };
    })
    .addEdge(START, 'vision_extract')
    .addEdge('vision_extract', 'topic_cleaning')
    .addEdge('topic_cleaning', 'concept_structuring')
    .addEdge('concept_structuring', 'prerequisite_hinting')
    .addEdge('prerequisite_hinting', 'final_state')
    .addEdge('final_state', END);

  return graph.compile();
}

export type SyllabusState = typeof SyllabusState.State;
