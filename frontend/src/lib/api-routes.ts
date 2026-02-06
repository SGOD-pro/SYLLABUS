// SYLLABUS – Centralized Backend API Routes
// Single source of truth for frontend ↔ backend contracts

export const API_ROUTES = {
  USERS: {
    ME: "/users/me",
  },

  PROFILE: {
    GET: "/profile",
    SETUP: "/profile/setup",
  },

  PLANNER: {
    TODAY: "/planner/today",
    GENERATE: "/planner/generate",
    PANIC_TOGGLE: "/planner/panic-toggle",
  },

  AI: {
    EXPLAIN_PLAN: "/ai/explain-plan",
    PARSE_SYLLABUS: "/ai/parse-syllabus",
  },

  SESSION: {
    SUBMIT: "/session/submit",
  },

  FEEDBACK: {
    CONCEPT: "/feedback/concept",
  },

  SUBJECTS: {
    GET: "/subjects",
    CREATE: "/subjects",
  },

  CONCEPTS: {
    BY_SUBJECT: (subjectId: string) => `/concepts/${subjectId}`,
    BULK: "/concepts/bulk",
    CREATE: "/concepts",
  },
} as const;
