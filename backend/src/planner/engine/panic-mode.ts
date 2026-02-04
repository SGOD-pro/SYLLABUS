export interface PanicOverrides {
  w1: number;
  w2: number;
  fatigueMultiplier: number;
}

export interface StudyProfile {
  dailyMinutes: number;
  fatigueThreshold: number;
  panicMode: boolean;
}

export function applyPanicMode(profile: StudyProfile): PanicOverrides {
  if (profile.panicMode) {
    return { w1: 2, w2: 4, fatigueMultiplier: 1.15 };
  }

  return { w1: 3, w2: 2, fatigueMultiplier: 1 };
}
