import type { StudentData } from '@/lib/types';
import { format, subDays } from 'date-fns';

const today = new Date();

export const initialStudentData: StudentData = {
  id: 'student-123',
  streak: 5,
  longestStreak: 12,
  progressHistory: [
    { date: format(subDays(today, 1), 'yyyy-MM-dd'), progress: 10, activity: 'Completed a chapter on React Hooks.' },
    { date: format(subDays(today, 2), 'yyyy-MM-dd'), progress: 10, activity: 'Practiced data structures.' },
    { date: format(subDays(today, 3), 'yyyy-MM-dd'), progress: 10, activity: 'Built a small project with Next.js.' },
    { date: format(subDays(today, 4), 'yyyy-MM-dd'), progress: 10, activity: 'Reviewed CSS Grid concepts.' },
    { date: format(subDays(today, 5), 'yyyy-MM-dd'), progress: 10, activity: 'Read documentation on Server Components.' },
    { date: format(subDays(today, 8), 'yyyy-MM-dd'), progress: 10, activity: 'Finished an online course module.' },
    { date: format(subDays(today, 9), 'yyyy-MM-dd'), progress: 10, activity: 'Watched a tutorial on Genkit.' },
    { date: format(subDays(today, 15), 'yyyy-MM-dd'), progress: 10, activity: 'Refactored old code.' },
    { date: format(subDays(today, 16), 'yyyy-MM-dd'), progress: 10, activity: 'Pair programming session.' },
    { date: format(subDays(today, 25), 'yyyy-MM-dd'), progress: 10, activity: 'Started learning a new language.' },
  ],
  notificationHistory: [
    {
      timestamp: subDays(today, 7).toISOString(),
      message: 'Keep your streak alive! A little progress goes a long way.',
      response: 'completed',
    },
  ],
};
