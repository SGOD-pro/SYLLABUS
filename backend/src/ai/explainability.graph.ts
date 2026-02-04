import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ExplainabilityStateAnnotation, ExplainabilityState } from "./explainability.state";
import { LlmFactory } from "./llm.factory";

/* ---------------- Nodes ---------------- */

function collectPlanDiff(state: ExplainabilityState) {
  const yesterday = state.yesterdayPlan?.sessions ?? [];
  const today = state.todayPlan.sessions;

  const yesterdayIds = new Set(yesterday.map((s: any) => s.conceptId));

  const added = today
    .filter((s: any) => !yesterdayIds.has(s.conceptId))
    .map((s: any) => s.conceptId);

  const removed = yesterday
    .filter((s: any) => !today.some((t: any) => t.conceptId === s.conceptId))
    .map((s: any) => s.conceptId);

  const orderChanges: any[] = [];
  const timeChanges: any[] = [];

  for (const s of today) {
    const prev = yesterday.find((p: any) => p.conceptId === s.conceptId);
    if (!prev) continue;

    if (prev.order !== s.order) {
      orderChanges.push({ conceptId: s.conceptId, from: prev.order, to: s.order });
    }

    if (prev.plannedMinutes !== s.plannedMinutes) {
      timeChanges.push({
        conceptId: s.conceptId,
        from: prev.plannedMinutes,
        to: s.plannedMinutes,
      });
    }
  }

  return {
    planDiff: { added, removed, orderChanges, timeChanges },
  };
}

function analyzeLearningSignals(state: ExplainabilityState) {
  return {
    learningSignals: {
      weakConcepts: state.recentSessions
        .filter(s => s.completionScore < 0.5)
        .map(s => s.conceptId),
      difficultConcepts: state.recentSessions
        .filter(s => s.difficultyFeedback >= 4)
        .map(s => s.conceptId),
      backlogInfluence: false,
    },
  };
}

async function generateReasoning(
  state: ExplainabilityState,
  llmFactory: LlmFactory,
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a calm, factual study-plan explainer. No suggestions."],
    ["human",
      [
        "Plan date: {date}",
        "Added: {added}",
        "Removed: {removed}",
        "Order changes: {orderChanges}",
        "Time changes: {timeChanges}",
        "Weak concepts: {weak}",
        "Difficult concepts: {difficult}",
        "Panic mode: {panic}",
      ].join("\n"),
    ],
  ]);

  const llm = llmFactory.getLLM({ temperature: 0.2 });

  const messages = await prompt.formatMessages({
    date: state.todayPlan.date,
    added: state.planDiff.added.join(", ") || "none",
    removed: state.planDiff.removed.join(", ") || "none",
    orderChanges: JSON.stringify(state.planDiff.orderChanges),
    timeChanges: JSON.stringify(state.planDiff.timeChanges),
    weak: state.learningSignals.weakConcepts.join(", ") || "none",
    difficult: state.learningSignals.difficultConcepts.join(", ") || "none",
    panic: state.profile.panicMode ? "on" : "off",
  });

  const res = await llm.invoke(messages);
  return { explanationText: String(res.content) };
}

/* ---------------- Graph ---------------- */

export function buildExplainabilityGraph(llmFactory: LlmFactory) {
  return new StateGraph(ExplainabilityStateAnnotation)
    .addNode("collect_plan_diff", collectPlanDiff)
    .addNode("analyze_learning_signals", analyzeLearningSignals)
    .addNode("generate_reasoning", (state) =>
      generateReasoning(state, llmFactory),
    )
    .addEdge(START, "collect_plan_diff")
    .addEdge("collect_plan_diff", "analyze_learning_signals")
    .addEdge("analyze_learning_signals", "generate_reasoning")
    .addEdge("generate_reasoning", END)
    .compile();
}
