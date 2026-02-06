// SYLLABUS - Core TypeScript Interfaces
type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: any
  token?: string | null
  getToken?: () => Promise<string | null>
  isMultipart?: boolean
}
type Degree = 'B.Tech' | 'M.Tech' | 'MSc' | 'BSc';

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

type SessionStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

type ResourcePlatform = 'NPTEL' | 'YouTube' | 'PDF' | 'Website';

interface Concept {
    id: string;
    name: string;
    difficulty: number; // 1-5 scale
    estimatedMinutes: number;
    isHighWeight: boolean;
    subjectId: string;
    prerequisites?: string[]; // Array of concept IDs
}

interface StudySession {
    id: string;
    conceptId: string;
    concept: Concept;
    plannedMinutes: number;
    order: number;
    status: SessionStatus;
    prerequisitesMet: boolean;
    completedAt?: Date;
    feedback?: SessionFeedback;
}

interface SessionFeedback {
    actualMinutes: number;
    completionPercent: number;
    difficultyRating: number; // 1-5 scale
    notes?: string;
    submittedAt: Date;
}

interface Subject {
    id: string;
    name: string;
    examDate: Date;
    isBacklog: boolean;
    creditWeight: number;
    concepts: Concept[];
}

interface AIInsight {
    id: string;
    explanationText: string;
    date: Date;
    isPanicMode: boolean;
}

interface Resource {
    id: string;
    title: string;
    url: string;
    platform: ResourcePlatform;
    conceptId?: string;
    isQuickRevision?: boolean;
}

interface UserProfile {
    id: string;
    degree: Degree;
    semester: number;
    branch: string;
    dailyHours: number;
    preferredSlots: TimeSlot[];
    daysOff: number[]; // 0-6 for Sunday-Saturday
    subjects: Subject[];
    createdAt: Date;
    // API fields
    dailyMinutes?: number;
    fatigueThreshold?: number;
}

interface OnboardingState {
    step: number;
    profile: Partial<UserProfile>;
    isComplete: boolean;
}

interface ParsedSyllabusTopic {
    id: string;
    name: string;
    isSelected: boolean;
    estimatedMinutes?: number;
}

// API Request/Response interfaces
interface CreateSubjectRequest {
    name: string;
    examDate: string; // ISO string
    priorityWeight: number; // 1.0 normal, 1.5 for backlog
    creditWeight: number;
}

interface ProfileSetupRequest {
    dailyMinutes: number;
    fatigueThreshold: number; // 2, 3, or 4
    preferredSlots: TimeSlot[];
}

interface ExplainPlanResponse {
    explanationText: string;
}

interface ParsedConcept {
    id: string;
    name: string;
    estimatedMinutes: number;
    difficulty: number;
}

interface SessionSubmitRequest {
    actualMinutes: number;
    completionScore: number; // 0.0 to 1.0
    difficultyFeedback: number; // 1-5
}
