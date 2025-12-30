import type { Timestamp } from "firebase/firestore";

export type ProgressEntry = {
  id?: string;
  date: string; // YYYY-MM-DD
  progress: number;
  activity: string;
  subject: string;
  userId: string;
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

export type UserProfile = {
  id: string;
  email: string | null;
  name: string | null;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp | null;
}
