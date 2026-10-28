import type { EmgLiveData } from "../types/emg";

export function makeMockData(reps: number, targetReps: number): EmgLiveData {
  const contraction = Math.random() > 0.5;
  return {
    activation: Math.floor(Math.random() * 100),
    reps,
    targetReps,
    completionRate: Math.round((reps / targetReps) * 100),
    contraction,
    feedback:
      reps >= targetReps
        ? "목표를 달성했습니다."
        : `목표까지 ${targetReps - reps}회 남았습니다.`,
  };
}