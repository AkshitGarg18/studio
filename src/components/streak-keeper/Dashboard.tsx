'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProgressEntry, UserProfile, Badge } from '@/lib/types';
import { format, subDays, isYesterday, isToday, parseISO, endOfToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';

import { ALL_BADGES, getXpForLevel, LEVEL_UP_XP_FACTOR, XP_PER_HOUR } from '@/lib/gamification';
import { StreakCard } from './StreakCard';
import { StreakChart } from './StreakChart';
import { ProgressForm } from './ProgressForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CalendarClock, Star } from 'lucide-react';
import { SubjectPerformanceChart } from './SubjectPerformanceChart';
import { WeeklyComparisonCard } from './WeeklyComparisonCard';
import { WeeklyReportCard } from './WeeklyReportCard';
import { LevelCard } from './LevelCard';
import { Skeleton } from '../ui/skeleton';

const generateChartData = (progressHistory: ProgressEntry[], days: number) => {
  const data: { date: string; progress: number }[] = [];
  const today = new Date();
  const progressMap = new Map(progressHistory.map(p => [format(parseISO(p.date), 'yyyy-MM-dd'), p.progress]));

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    data.push({
      date: date.toISOString(),
      progress: progressMap.get(dateString) || 0,
    });
  }
  return data;
};

const LastLogCard = ({ date }: { date: string | null }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Last Log Date</CardTitle>
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {date ? format(parseISO(date), 'MMM dd, yyyy') : 'No logs yet'}
        </div>
        <p className="text-xs text-muted-foreground">
          {date ? 'Your last recorded activity.' : 'Log your progress to start.'}
        </p>
      </CardContent>
    </Card>
  );
};


export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [streakEndTime, setStreakEndTime] = useState<Date | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const progressHistoryRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'progress');
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: progressHistory, isLoading: isHistoryLoading } = useCollection<ProgressEntry>(progressHistoryRef);

  const sortedHistory = useMemo(() => {
    if (!progressHistory) return [];
    return [...progressHistory].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [progressHistory]);

  useEffect(() => {
    if (!userProfile || !sortedHistory) {
      setStreakEndTime(null);
      return;
    }

    const { currentStreak } = userProfile;
    const lastEntry = sortedHistory[0];

    if (currentStreak > 0 && lastEntry) {
      const lastEntryDate = parseISO(lastEntry.date);
      if (isYesterday(lastEntryDate)) {
        setStreakEndTime(endOfToday());
      } else {
        setStreakEndTime(null);
      }
    } else {
      setStreakEndTime(null);
    }
  }, [userProfile, sortedHistory]);

  const handleProgressSubmit = async (data: { progress: number; activity: string; subject: string }) => {
    if (!user || !firestore || !userProfile) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastEntry = sortedHistory.length > 0 ? sortedHistory[0] : null;

    let newStreak = userProfile.currentStreak;
    
    if (lastEntry) {
      const lastEntryDate = parseISO(lastEntry.date);
      if (isToday(lastEntryDate)) {
        // Already logged today, streak doesn't increase
      } else if (isYesterday(lastEntryDate)) {
        newStreak++;
      } else {
        newStreak = 1; // Streak is broken, reset to 1
      }
    } else {
      newStreak = 1; // First entry
    }

    const newLongestStreak = Math.max(userProfile.longestStreak, newStreak);
    
    let newXp = userProfile.xp + (data.progress * XP_PER_HOUR);
    let newLevel = userProfile.level;
    const xpForNextLevel = getXpForLevel(newLevel + 1);

    if (newXp >= xpForNextLevel) {
      newLevel++;
      toast({
        title: "Level Up! 🎉",
        description: `Congratulations! You've reached Level ${newLevel}.`,
      });
    }
    
    const preUpdateData = { ...userProfile, currentStreak: newStreak, longestStreak: newLongestStreak, progressHistory: sortedHistory, level: newLevel, xp: newXp };

    const newlyAwardedBadges: Badge[] = [];
    let updatedBadges = [...userProfile.badges];
    ALL_BADGES.forEach(badge => {
        if (!updatedBadges.includes(badge.id) && badge.threshold(preUpdateData, sortedHistory)) {
            newlyAwardedBadges.push(badge);
            updatedBadges.push(badge.id);
        }
    });

    if (newlyAwardedBadges.length > 0) {
        newlyAwardedBadges.forEach(badge => {
            toast({
                title: 'New Badge Unlocked! 🏅',
                description: `You've earned the "${badge.name}" badge!`,
            });
        });
    }
    
    // Create new progress entry
    const newProgressEntry = {
      date: todayStr,
      ...data,
      userId: user.uid,
    };

    const newProgressDocRef = doc(collection(firestore, `users/${user.uid}/progress`));
    setDocumentNonBlocking(newProgressDocRef, newProgressEntry, { merge: true });

    // Update user profile
    const userProfileUpdate = {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: serverTimestamp(),
        level: newLevel,
        xp: newXp,
        badges: updatedBadges
    };
    setDocumentNonBlocking(userProfileRef!, userProfileUpdate, { merge: true });

    setStreakEndTime(null);
    
    toast({
      title: "Progress Logged!",
      description: `You've earned ${data.progress * XP_PER_HOUR} XP.`,
    });
  };

  const handleGetPerformanceTips = async (currentWeekProgress: number, previousWeekProgress: number) => {
    return { tips: [] };
  };

  const weeklyStats = useMemo(() => {
    if (!sortedHistory) return { currentWeekProgress: 0, lastWeekProgress: 0, currentWeekEntries: [], lastWeekEntries: [] };
    
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const endOfLastWeek = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });

    const currentWeekProgress = sortedHistory
      .filter(p => isWithinInterval(parseISO(p.date), { start: startOfThisWeek, end: endOfThisWeek }))
      .reduce((sum, p) => sum + p.progress, 0);

    const currentWeekEntries = sortedHistory.filter(p => isWithinInterval(parseISO(p.date), { start: startOfThisWeek, end: endOfThisWeek }));
    
    const lastWeekProgress = sortedHistory
      .filter(p => isWithinInterval(parseISO(p.date), { start: startOfLastWeek, end: endOfLastWeek }))
      .reduce((sum, p) => sum + p.progress, 0);

    const lastWeekEntries = sortedHistory.filter(p => isWithinInterval(parseISO(p.date), { start: startOfLastWeek, end: endOfLastWeek }));

    return { currentWeekProgress, lastWeekProgress, currentWeekEntries, lastWeekEntries };
  }, [sortedHistory]);

  const handleGetWeeklyReport = async () => {
    return { reportSummary: 'Not implemented', nextWeekSuggestions: [] };
  };

  if (isProfileLoading || isHistoryLoading) {
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5 p-4 md:p-6 lg:p-8">
            <div className="lg:col-span-3 grid auto-rows-min gap-4 md:gap-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-[125px] w-full" />
                    <Skeleton className="h-[125px] w-full" />
                    <Skeleton className="h-[125px] w-full" />
                </div>
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="lg:col-span-2 grid auto-rows-min gap-4 md:gap-8">
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        </div>
    );
  }

  const chartData7Days = generateChartData(sortedHistory, 7);
  const chartData30Days = generateChartData(sortedHistory, 30);
  const longestStreakEmoji = (userProfile?.longestStreak ?? 0) > 10 ? '🏆' : (userProfile?.longestStreak ?? 0) > 5 ? '🏅' : '🎉';
  const lastLogDate = sortedHistory.length > 0 ? sortedHistory[0].date : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 grid auto-rows-min gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StreakCard 
            title="Current Streak" 
            streak={userProfile?.currentStreak ?? 0}
            streakEndDate={streakEndTime}
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(userProfile?.longestStreak ?? 0)} days {longestStreakEmoji}</div>
              <p className="text-xs text-muted-foreground">Your personal best!</p>
            </CardContent>
          </Card>
          <LevelCard
            level={userProfile?.level ?? 1}
            xp={userProfile?.xp ?? 0}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
            <LastLogCard date={lastLogDate} />
            <WeeklyComparisonCard 
                currentWeekHours={weeklyStats.currentWeekProgress}
                previousWeekHours={weeklyStats.lastWeekProgress}
                onGetTips={() => handleGetPerformanceTips(weeklyStats.currentWeekProgress, weeklyStats.lastWeekProgress)}
            />
        </div>
        <StreakChart 
            data={chartData7Days} 
            title="7-Day Progress Report"
            dateFormat="eee" 
        />
        <StreakChart 
            data={chartData30Days} 
            title="30-Day Progress Report"
            dateFormat="dd" 
        />
      </div>

      <div className="lg:col-span-2 grid auto-rows-min gap-4 md:gap-8">
        <ProgressForm onSubmit={handleProgressSubmit} />
        <SubjectPerformanceChart progressHistory={sortedHistory} />
        <WeeklyReportCard onGenerateReport={handleGetWeeklyReport} />
      </div>
    </div>
  );
}
