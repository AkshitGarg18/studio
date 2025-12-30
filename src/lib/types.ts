export type ProgressEntry = {
  date: string; // YYYY-MM-DD
  progress: number;
  activity: string;
};

export type Notification = {
  timestamp: string;
  message: string;
  response?: string;
};

export type StudentData = {
  id: string;
  streak: number;
  longestStreak: number;
  progressHistory: ProgressEntry[];
  notificationHistory: Notification[];
};
