import type { Badge, ProgressEntry, UserProfile } from './types';

// --- XP & Leveling Constants ---
export const XP_PER_HOUR = 100;
export const LEVEL_UP_XP_FACTOR = 1.5; // Each level requires 1.5x more XP than the last

/**
 * Calculates the total XP required to reach a specific level.
 * @param level The target level.
 * @returns The total XP needed to reach that level.
 */
export const getXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // This formula creates an exponential curve for leveling up.
  // Formula: 100 * (1.5^(level - 1) - 1) / (1.5 - 1) simplified
  return Math.floor(200 * (Math.pow(LEVEL_UP_XP_FACTOR, level - 1) - 1));
};

// --- Badge Definitions ---
export const ALL_BADGES: Badge[] = [
  // Streak Badges
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Achieve a 3-day streak.',
    icon: 'Flame',
    threshold: (data) => data.currentStreak >= 3,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak.',
    icon: 'Flame',
    threshold: (data) => data.currentStreak >= 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Conquer a 30-day streak.',
    icon: 'Trophy',
    threshold: (data) => data.currentStreak >= 30,
  },
  
  // Level Badges
  {
    id: 'level-novice',
    name: 'Novice Learner',
    description: 'Reach Level 2.',
    icon: 'Star',
    threshold: (data) => data.level >= 2,
  },
  {
    id: 'level-adept',
    name: 'Adept Scholar',
    description: 'Reach Level 5.',
    icon: 'Star',
    threshold: (data) => data.level >= 5,
  },
  {
    id: 'level-expert',
    name: 'Expert Virtuoso',
    description: 'Reach Level 10.',
    icon: 'Crown',
    threshold: (data) => data.level >= 10,
  },

  // Progress Badges
  {
    id: 'first-log',
    name: 'First Step',
    description: 'Log your very first activity.',
    icon: 'Footprints',
    threshold: (data, progress) => progress.length >= 1,
  },

  // Milestone Badges
  {
    id: 'ten-hours',
    name: 'Diligent Student',
    description: 'Log a total of 10 hours.',
    icon: 'Clock',
    threshold: (data, progress) => progress.reduce((sum, p) => sum + p.progress, 0) >= 10,
  },
  {
    id: 'fifty-hours',
    name: 'Time Titan',
    description: 'Log a total of 50 hours.',
    icon: 'Clock',
    threshold: (data, progress) => progress.reduce((sum, p) => sum + p.progress, 0) >= 50,
  },

  // Consistency Badges
  {
    id: 'weekend-learner',
    name: 'Weekend Learner',
    description: 'Log an activity on a Saturday or Sunday.',
    icon: 'Calendar',
    threshold: (data, progress) => progress.some(p => {
        const day = new Date(p.date).getDay();
        return day === 6 || day === 0;
    }),
  },
];
