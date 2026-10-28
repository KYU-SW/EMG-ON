export interface EmgLiveData {
  activation: number;
  reps: number;
  targetReps: number;
  completionRate: number;
  contraction: boolean;
  feedback: string;
}

export interface SessionRecord {
  id: number;
  date: string;
  exercise: string;
  reps: number;
  targetReps: number;
  avgContraction: number;
  completionRate: number;
}