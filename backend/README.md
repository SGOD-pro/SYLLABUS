prompt ->

This is a NestJS backend for an AI Study Planner (Indian engineering focus).

Stack:
- NestJS
- MongoDB + Mongoose
- TypeScript strict
- Repository pattern enforced
- DbModule already exists and is configured in app.module.ts
- Authentication via custom ClerkAuthGuard
- req.user.clerkId is available on protected routes

CRITICAL ARCHITECTURE RULES (NON-NEGOTIABLE):
1. planner/engine is PURE TypeScript
   - NO NestJS
   - NO database
   - NO LangChain / LangGraph / OpenAI
2. planner service/controller/module MAY NOT contain planning logic
3. Planner engine is deterministic and testable in isolation
4. AI module is SEPARATE and comes later
5. Do NOT change file structure
6. Do NOT add new planner files
7. Only complete or refine existing files


ARCHITECTURE ENFORCEMENT:

- All database operations MUST live in a Repository class.
- Services MUST NOT import or use Mongoose models directly.
- Controllers MUST NOT talk to repositories directly.
- Repository exposes only intent-based methods (no raw queries).
- Mapper handles all entity → DTO transformations.



on every session ->
GLOBAL PROJECT CONTEXT:

This is a NestJS backend for an AI Study Planner (Indian engineering focus).

Stack:
- NestJS
- MongoDB + Mongoose
- TypeScript (strict)
- Repository pattern enforced
- DbModule already exists and is configured in app.module.ts
- Authentication via a custom ClerkAuthGuard
- req.user.clerkId is available on protected routes

DOMAIN OVERVIEW:
- Users own Profiles
- Profiles define study capacity and panic mode
- Subjects belong to users
- Concepts belong to subjects and form a DAG
- Planner engine produces a deterministic daily StudyPlan
- StudySession data is feedback only
- AI explains decisions later (not part of planning)

CRITICAL ARCHITECTURE RULES (NON-NEGOTIABLE):
1. planner/engine is PURE TypeScript
   - NO NestJS
   - NO database
   - NO LangChain / LangGraph / OpenAI
2. Planner service/controller/module MUST NOT contain planning logic
3. Planner engine must be deterministic and testable in isolation
4. AI module is completely separate and comes later
5. Do NOT change file structure
6. Do NOT add new planner files unless explicitly asked
7. Only complete or refine existing files

ARCHITECTURE ENFORCEMENT:
- All database operations MUST live in Repository classes
- Services MUST NOT import or use Mongoose models directly
- Controllers MUST NOT talk to repositories directly
- Repositories expose intent-based methods only
- Mappers handle all entity → DTO transformations
