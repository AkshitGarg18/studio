'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { ProgressEntry, UserProfile, Badge, Notification } from '@/lib/types';
import { format, subDays, isYesterday, isToday, parseISO, endOfToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

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
import { ShareBadgeDialog } from './ShareBadgeDialog';
import { Button } from '../ui/button';
import { intelligentStreakLossNotification, type NotificationInput, type NotificationOutput } from '@/ai/flows/intelligent-streak-loss-notification';
import { NotificationCard } from './NotificationCard';
import { GoalCard } from './GoalCard';
import { personalizedStreakGoal, type PersonalizedStreakGoalInput, type PersonalizedStreakGoalOutput } from '@/ai/flows/personalized-streak-goal';

const generateChartData = (progressHistory: ProgressEntry[], days: number) => {
  const data: { date: string; progress: number }[] = [];
  const today = new Date();
  
  // Create a map to store total progress for each day
  const progressMap = new Map<string, number>();
  progressHistory.forEach(p => {
    const dateKey = format(parseISO(p.date), 'yyyy-MM-dd');
    progressMap.set(dateKey, (progressMap.get(dateKey) || 0) + p.progress);
  });

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
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isSimulatingNotification, setIsSimulatingNotification] = useState(false);
  const [goal, setGoal] = useState<PersonalizedStreakGoalOutput | null>(null);
  const [isGoalLoading, setIsGoalLoading] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const progressHistoryRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'progress');
  }, [firestore, user]);
  
  const { data: progressHistory, isLoading: isHistoryLoading } = useCollection<ProgressEntry>(progressHistoryRef);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const sortedHistory = useMemo(() => {
    if (!progressHistory) return [];
    return [...progressHistory].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [progressHistory]);

  const chartData7Days = useMemo(() => generateChartData([], 7), []);
  const chartData30Days = useMemo(() => generateChartData([], 30), []);

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
  
  const openShareDialog = (badge: Badge) => {
    setSelectedBadge(badge);
    setShareDialogOpen(true);
  };

  const handleProgressSubmit = async (data: { progress: number; activity: string; subject: string }) => {
    if (!user || !firestore || !userProfile || !progressHistory || !progressHistoryRef) return;
  
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastEntry = sortedHistory.length > 0 ? sortedHistory[0] : null;
    let newStreak = userProfile.currentStreak;
  
    const todayEntries = progressHistory.filter(p => p.date === todayStr);
    const existingTodayEntry = todayEntries.length > 0 ? todayEntries[0] : null;
          
    if (!existingTodayEntry) {
      // No entry for today, this is a new log for the day
      if (lastEntry) {
        const lastEntryDate = parseISO(lastEntry.date);
        if (isYesterday(lastEntryDate)) {
          newStreak++;
        } else if (!isToday(lastEntryDate)) {
          newStreak = 1; // Streak is broken
        }
      } else {
        newStreak = 1; // First entry ever
      }
    }
    // If there's an existing entry, streak is already set for the day, no change.
  
    const newLongestStreak = Math.max(userProfile.longestStreak, newStreak);
    const addedXp = data.progress * XP_PER_HOUR;
    let newXp = userProfile.xp + addedXp;
    let newLevel = userProfile.level;
    
    // Check for level up
    let xpForNextLevel = getXpForLevel(newLevel + 1);
    while (newLevel < 100 && newXp >= xpForNextLevel) {
        newLevel++;
        toast({
            title: "Level Up! 🎉",
            description: `Congratulations! You've reached Level ${newLevel}.`,
        });
        xpForNextLevel = getXpForLevel(newLevel + 1);
    }
  
    // Badge calculation
    const allProgressEntries = [...progressHistory];
    if (existingTodayEntry) {
        const index = allProgressEntries.findIndex(p => p.id === existingTodayEntry.id);
        if (index !== -1) {
            allProgressEntries[index].progress += data.progress;
        }
    } else {
        allProgressEntries.unshift({ ...data, date: todayStr, userId: user.uid, id: 'temp' });
    }

    const preUpdateData = { ...userProfile, currentStreak: newStreak, longestStreak: newLongestStreak, level: newLevel, xp: newXp };
    const newlyAwardedBadges: Badge[] = [];
    let updatedBadges = [...userProfile.badges];
    ALL_BADGES.forEach(badge => {
      if (!updatedBadges.includes(badge.id) && badge.threshold(preUpdateData, allProgressEntries)) {
        newlyAwardedBadges.push(badge);
        updatedBadges.push(badge.id);
      }
    });
  
    if (newlyAwardedBadges.length > 0) {
        newlyAwardedBadges.forEach(badge => {
            toast({
              title: 'New Badge Unlocked! 🏅',
              description: `You've earned the "${badge.name}" badge!`,
              action: (
                <Button variant="outline" size="sm" onClick={() => openShareDialog(badge)}>
                  Share
                </Button>
              ),
            });
          });
    }
    
    // Firestore updates
    if (existingTodayEntry && existingTodayEntry.id) {
        const progressDocRef = doc(firestore, `users/${user.uid}/progress`, existingTodayEntry.id);
        const updatedProgressData = {
          progress: existingTodayEntry.progress + data.progress,
          activity: `${existingTodayEntry.activity}; ${data.activity}`, // Combine activities
        };
        updateDocumentNonBlocking(progressDocRef, updatedProgressData);
    } else {
        const newProgressEntry = { date: todayStr, ...data, userId: user.uid };
        addDocumentNonBlocking(progressHistoryRef, newProgressEntry);
    }
    
    const userProfileUpdate = {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: serverTimestamp(),
      level: newLevel,
      xp: newXp,
      badges: updatedBadges,
    };
    setDocumentNonBlocking(userProfileRef!, userProfileUpdate, { merge: true });
  
    if (newStreak > userProfile.currentStreak) {
        setStreakEndTime(null);
    }
  
    toast({
      title: "Progress Logged!",
      description: `You've earned ${addedXp} XP.`,
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

  const handleSimulateNotification = async () => {
    if (!user || !userProfile) return;

    setIsSimulatingNotification(true);
    try {
      const notificationHistory: Notification[] = []; // In a real app, this would be fetched
      const input: NotificationInput = {
        studentId: user.uid,
        streakLength: userProfile.currentStreak,
        lastActivity: userProfile.lastActivityDate ? format(userProfile.lastActivityDate.toDate(), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notificationHistory: notificationHistory,
      };

      const result = await intelligentStreakLossNotification(input);

      toast({
        title: 'Simulated AI Notification 🤖',
        description: result.notificationMessage,
      });

    } catch (error) {
      console.error('Error simulating notification:', error);
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: 'Could not generate the AI notification.',
      });
    } finally {
      setIsSimulatingNotification(false);
    }
  };
  
  const handleGetGoal = async () => {
    if (!user || !progressHistory) return;

    setIsGoalLoading(true);
    try {
        const input: PersonalizedStreakGoalInput = {
            studentId: user.uid,
            historicalProgressData: progressHistory.map(p => ({ date: p.date, progress: p.progress })),
        };
        const result = await personalizedStreakGoal(input);
        setGoal(result);
    } catch (error) {
        console.error("Error getting personalized goal:", error);
        toast({
            variant: "destructive",
            title: "Goal Generation Failed",
            description: "Could not generate a personalized goal.",
        });
    } finally {
        setIsGoalLoading(false);
    }
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

  const longestStreakEmoji = (userProfile?.longestStreak ?? 0) > 10 ? '🏆' : (userProfile?.longestStreak ?? 0) > 5 ? '🏅' : '🎉';
  const lastLogDate = sortedHistory.length > 0 ? sortedHistory[0].date : null;

  return (
    <>
      <ShareBadgeDialog 
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        badge={selectedBadge}
        userName={userProfile?.name ?? "A great learner"}
      />
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
          <NotificationCard 
            isLoading={isSimulatingNotification}
            onSimulate={handleSimulateNotification}
          />
          <GoalCard goal={goal} isLoading={isGoalLoading} onGetGoal={handleGetGoal} />
        </div>
      </div>
    </>
  );
}
