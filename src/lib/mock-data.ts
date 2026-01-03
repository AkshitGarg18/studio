import type { StudentData } from '@/lib/types';
import { format, subDays } from 'date-fns';

const today = new Date();

export const initialStudentData: StudentData = {
  id: 'student-123',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  streak: 5,
  longestStreak: 12,
  level: 3,
  xp: 250,
  badges: ['streak-starter', 'level-novice'],
  progressHistory: [
    { userId: 'student-123', date: format(subDays(today, 1), 'yyyy-MM-dd'), progress: 2, activity: 'Completed a chapter on React Hooks.', subject: 'React' },
    { userId: 'student-123', date: format(subDays(today, 2), 'yyyy-MM-dd'), progress: 1.5, activity: 'Practiced data structures.', subject: 'Algorithms' },
    { userId: 'student-123', date: format(subDays(today, 3), 'yyyy-MM-dd'), progress: 3, activity: 'Built a small project with Next.js.', subject: 'Next.js' },
    { userId: 'student-123', date: format(subDays(today, 4), 'yyyy-MM-dd'), progress: 1, activity: 'Reviewed CSS Grid concepts.', subject: 'CSS' },
    { userId: 'student-123', date: format(subDays(today, 5), 'yyyy-MM-dd'), progress: 2.5, activity: 'Read documentation on Server Components.', subject: 'Next.js' },
    { userId: 'student-123', date: format(subDays(today, 8), 'yyyy-MM-dd'), progress: 4, activity: 'Finished an online course module.', subject: 'React' },
    { userId: 'student-123', date: format(subDays(today, 9), 'yyyy-MM-dd'), progress: 1, activity: 'Watched a tutorial on Genkit.', subject: 'Genkit' },
    { userId: 'student-123', date: format(subDays(today, 15), 'yyyy-MM-dd'), progress: 2, activity: 'Refactored old code.', subject: 'Algorithms' },
    { userId: 'student-123', date: format(subDays(today, 16), 'yyyy-MM-dd'), progress: 3.5, activity: 'Pair programming session.', subject: 'React' },
    { userId: 'student-123', date: format(subDays(today, 25), 'yyyy-MM-dd'), progress: 5, activity: 'Started learning a new language.', subject: 'Go' },
  ],
  notificationHistory: [
    {
      timestamp: subDays(today, 7).toISOString(),
      message: 'Keep your streak alive! A little progress goes a long way.',
      response: 'completed',
    },
  ],
};
