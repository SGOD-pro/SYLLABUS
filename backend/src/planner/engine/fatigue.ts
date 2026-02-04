export function exceedsFatigue(
  difficulty: number,
  minutes: number,
  fatigueThreshold: number,
): boolean {
  const cognitiveLoad = difficulty * minutes;
  return cognitiveLoad > fatigueThreshold;
}
