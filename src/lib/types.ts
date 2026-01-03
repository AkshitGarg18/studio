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

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  threshold: (userProfile: UserProfile, progressHistory: ProgressEntry[]) => boolean;
};

export type StudentData = {
  id: string;
  name: string;
  email: string;
  streak: number;
  longestStreak: number;
  progressHistory: ProgressEntry[];
  notificationHistory: Notification[];
  level: number;
  xp: number;
  badges: string[];
};

export type UserProfile = {
  id: string;
  email: string | null;
  name: string | null;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp | null;
  level: number;
  xp: number;
  badges: string[];
}
