import type { SessionRecord } from "../types/emg";

export const mockSessions: SessionRecord[] = [
  { id: 1, date: "10월 7일", exercise: "팔꿈치 굽힘", reps: 8, targetReps: 10, avgContraction: 2.8, completionRate: 80 },
  { id: 2, date: "10월 5일", exercise: "팔꿈치 굽힘", reps: 7, targetReps: 10, avgContraction: 2.5, completionRate: 70 },
  { id: 3, date: "10월 3일", exercise: "팔꿈치 굽힘", reps: 6, targetReps: 10, avgContraction: 2.3, completionRate: 60 },
];