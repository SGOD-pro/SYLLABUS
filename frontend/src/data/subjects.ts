// SYLLABUS - Indian Engineering Subject Database
// Pre-populated subjects for B.Tech, M.Tech, MSc, BSc

import { v4 as uuidv4 } from "uuid";

// import { Degree, Subject, Concept } from '@/types';

interface SubjectTemplate {
  name: string;
  concepts: Array<{ name: string; estimatedMinutes: number; difficulty: number; isHighWeight: boolean }>;
}

// B.Tech Computer Science Subjects
const btechCSSubjects: SubjectTemplate[] = [
  {
    name: 'Data Structures',
    concepts: [
      { name: 'Arrays & Strings', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Linked Lists', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Stacks & Queues', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Trees - Binary Trees', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'BST Operations', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'AVL Trees', estimatedMinutes: 60, difficulty: 4, isHighWeight: false },
      { name: 'Heap & Priority Queue', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Graph Traversals (BFS/DFS)', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Hashing Techniques', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Sorting Algorithms', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
    ],
  },
  {
    name: 'Database Management Systems (DBMS)',
    concepts: [
      { name: 'ER Model & Diagrams', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Relational Model', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'SQL Queries', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Normalization (1NF to BCNF)', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Transactions & ACID', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Concurrency Control', estimatedMinutes: 60, difficulty: 4, isHighWeight: false },
      { name: 'Indexing & B+ Trees', estimatedMinutes: 45, difficulty: 4, isHighWeight: true },
      { name: 'Query Optimization', estimatedMinutes: 45, difficulty: 4, isHighWeight: false },
    ],
  },
  {
    name: 'Operating Systems',
    concepts: [
      { name: 'Process Management', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'CPU Scheduling', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Process Synchronization', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Deadlocks', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Memory Management', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Virtual Memory', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'File Systems', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
      { name: 'Disk Scheduling', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
    ],
  },
  {
    name: 'Computer Networks',
    concepts: [
      { name: 'OSI & TCP/IP Models', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Physical Layer', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
      { name: 'Data Link Layer', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Network Layer & IP', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Routing Algorithms', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Transport Layer (TCP/UDP)', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Application Layer Protocols', estimatedMinutes: 45, difficulty: 2, isHighWeight: false },
      { name: 'Network Security Basics', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
    ],
  },
  {
    name: 'Theory of Computation',
    concepts: [
      { name: 'Finite Automata (DFA/NFA)', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Regular Expressions', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Context-Free Grammars', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Pushdown Automata', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Turing Machines', estimatedMinutes: 60, difficulty: 5, isHighWeight: true },
      { name: 'Decidability', estimatedMinutes: 45, difficulty: 5, isHighWeight: false },
      { name: 'Complexity Classes (P, NP)', estimatedMinutes: 45, difficulty: 4, isHighWeight: true },
    ],
  },
  {
    name: 'Compiler Design',
    concepts: [
      { name: 'Lexical Analysis', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Syntax Analysis - Parsing', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Semantic Analysis', estimatedMinutes: 45, difficulty: 4, isHighWeight: false },
      { name: 'Intermediate Code Generation', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Code Optimization', estimatedMinutes: 45, difficulty: 4, isHighWeight: false },
      { name: 'Code Generation', estimatedMinutes: 45, difficulty: 4, isHighWeight: true },
    ],
  },
  {
    name: 'Machine Learning',
    concepts: [
      { name: 'Linear Regression', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Logistic Regression', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Decision Trees', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'SVM', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Neural Networks Basics', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Clustering (K-Means)', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
      { name: 'Dimensionality Reduction', estimatedMinutes: 45, difficulty: 4, isHighWeight: false },
    ],
  },
  {
    name: 'Digital Logic Design',
    concepts: [
      { name: 'Boolean Algebra', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'K-Maps', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Combinational Circuits', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Sequential Circuits', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Flip-Flops & Counters', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
    ],
  },
  {
    name: 'Software Engineering',
    concepts: [
      { name: 'SDLC Models', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
      { name: 'Requirements Engineering', estimatedMinutes: 45, difficulty: 2, isHighWeight: false },
      { name: 'Design Patterns', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Testing Techniques', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Agile Methodologies', estimatedMinutes: 45, difficulty: 2, isHighWeight: true },
    ],
  },
  {
    name: 'Engineering Mathematics',
    concepts: [
      { name: 'Linear Algebra', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Calculus', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Probability', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Statistics', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Differential Equations', estimatedMinutes: 60, difficulty: 4, isHighWeight: false },
    ],
  },
];

// M.Tech Subjects
const mtechSubjects: SubjectTemplate[] = [
  {
    name: 'Advanced Algorithms',
    concepts: [
      { name: 'Amortized Analysis', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Randomized Algorithms', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Approximation Algorithms', estimatedMinutes: 60, difficulty: 5, isHighWeight: true },
      { name: 'Network Flow', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Linear Programming', estimatedMinutes: 60, difficulty: 4, isHighWeight: false },
    ],
  },
  {
    name: 'Distributed Systems',
    concepts: [
      { name: 'Distributed Consensus', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Replication Strategies', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'CAP Theorem', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Distributed Transactions', estimatedMinutes: 60, difficulty: 5, isHighWeight: true },
      { name: 'MapReduce', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
    ],
  },
  {
    name: 'Research Methodology',
    concepts: [
      { name: 'Literature Review', estimatedMinutes: 45, difficulty: 2, isHighWeight: false },
      { name: 'Research Design', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Data Analysis Methods', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Academic Writing', estimatedMinutes: 45, difficulty: 2, isHighWeight: false },
    ],
  },
];

// MSc Subjects
const mscSubjects: SubjectTemplate[] = [
  {
    name: 'Mathematical Analysis',
    concepts: [
      { name: 'Real Analysis', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Complex Analysis', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Functional Analysis', estimatedMinutes: 60, difficulty: 5, isHighWeight: true },
    ],
  },
  {
    name: 'Quantum Mechanics',
    concepts: [
      { name: 'Wave Functions', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Schrödinger Equation', estimatedMinutes: 60, difficulty: 5, isHighWeight: true },
      { name: 'Quantum States', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
    ],
  },
];

// BSc Subjects
const bscSubjects: SubjectTemplate[] = [
  {
    name: 'General Physics',
    concepts: [
      { name: 'Mechanics', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Thermodynamics', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Electromagnetism', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
      { name: 'Optics', estimatedMinutes: 45, difficulty: 3, isHighWeight: false },
    ],
  },
  {
    name: 'General Chemistry',
    concepts: [
      { name: 'Atomic Structure', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Chemical Bonding', estimatedMinutes: 45, difficulty: 3, isHighWeight: true },
      { name: 'Organic Chemistry Basics', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
    ],
  },
  {
    name: 'Mathematics',
    concepts: [
      { name: 'Calculus', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Linear Algebra', estimatedMinutes: 60, difficulty: 3, isHighWeight: true },
      { name: 'Differential Equations', estimatedMinutes: 60, difficulty: 4, isHighWeight: true },
    ],
  },
];

export const getSubjectsForDegree = (degree: Degree): SubjectTemplate[] => {
  switch (degree) {
    case 'B.Tech':
      return btechCSSubjects;
    case 'M.Tech':
      return mtechSubjects;
    case 'MSc':
      return mscSubjects;
    case 'BSc':
      return bscSubjects;
    default:
      return btechCSSubjects;
  }
};

export const createSubjectFromTemplate = (
  template: SubjectTemplate,
  examDate: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
): Subject => {
  
  const subjectId = uuidv4();
  
  const concepts: Concept[] = template.concepts.map((c, index) => ({
    id: uuidv4(),
    name: c.name,
    estimatedMinutes: c.estimatedMinutes,
    difficulty: c.difficulty,
    isHighWeight: c.isHighWeight,
    subjectId,
    prerequisites: index > 0 ? [template.concepts[index - 1].name] : undefined,
  }));

  return {
    id: subjectId,
    name: template.name,
    examDate,
    isBacklog: false,
    creditWeight: 4,
    concepts,
  };
};

export const getAllSubjectNames = (): string[] => {
  const allSubjects = [
    ...btechCSSubjects,
    ...mtechSubjects,
    ...mscSubjects,
    ...bscSubjects,
  ];
  return [...new Set(allSubjects.map((s) => s.name))];
};
