'use client';

import { useState, useEffect } from 'react';
import type { StudentData, ProgressEntry } from '@/lib/types';
import { format, subDays, isYesterday, isToday, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { personalizedStreakGoal, type PersonalizedStreakGoalOutput } from '@/ai/flows/personalized-streak-goal';
import { intelligentStreakLossNotification } from '@/ai/flows/intelligent-streak-loss-notification';

import { StreakCard } from './StreakCard';
import { StreakChart } from './StreakChart';
import { ProgressForm } from './ProgressForm';
import { GoalCard } from './GoalCard';
import { NotificationCard } from './NotificationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';

const generateChartData = (progressHistory: ProgressEntry[]) => {
  const data: { date: string; progress: number }[] = [];
  const today = new Date();
  const progressMap = new Map(progressHistory.map(p => [p.date, p.progress]));

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const shortDateString = format(date, 'MMM d');
    
    data.push({
      date: shortDateString,
      progress: progressMap.get(dateString) || 0,
    });
  }
  return data;
};

export function Dashboard({ initialData }: { initialData: StudentData }) {
  const [studentData, setStudentData] = useState<StudentData>(initialData);
  const [goal, setGoal] = useState<PersonalizedStreakGoalOutput | null>(null);
  const [isGoalLoading, setIsGoalLoading] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const progressColRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'dailyProgress') : null, [firestore, user]);
  
  const { data: progressHistory, isLoading: isProgressLoading } = useCollection<ProgressEntry>(progressColRef);

  useEffect(() => {
    if (user && userDocRef) {
      const unsub = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setStudentData(prev => ({
            ...prev,
            id: user.uid,
            streak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
          }));
        } else {
           // Create user document if it doesn't exist
           setDocumentNonBlocking(userDocRef, {
             id: user.uid,
             email: user.email,
             name: user.displayName,
             currentStreak: 0,
             longestStreak: 0,
             lastActivityDate: null
           }, { merge: true });
        }
      });
      return () => unsub();
    }
  }, [user, userDocRef]);


  useEffect(() => {
    if (progressHistory) {
      const sortedHistory = [...progressHistory].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      setStudentData(prev => ({ ...prev, progressHistory: sortedHistory }));
    }
  }, [progressHistory]);

  const handleProgressSubmit = (data: { progress: number; activity: string }) => {
    if (!user || !progressColRef || !userDocRef) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastEntry = studentData.progressHistory.length > 0 ? studentData.progressHistory[0] : null;

    let newStreak = studentData.streak;
    
    if (lastEntry) {
      const lastEntryDate = parseISO(lastEntry.date);
      if (isToday(lastEntryDate)) {
        // Already logged today, streak doesn't change
      } else if (isYesterday(lastEntryDate)) {
        newStreak++;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(studentData.longestStreak, newStreak);

    // Add new progress entry to subcollection
    addDocumentNonBlocking(progressColRef, {
      date: todayStr,
      ...data,
      userId: user.uid,
    });
    
    // Update streak info on user document
    setDocumentNonBlocking(userDocRef, {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: todayStr,
    }, { merge: true });
    
    toast({
      title: "Progress Logged!",
      description: "Great job on staying consistent.",
    });
  };
  
  const handleGetGoal = async () => {
    setIsGoalLoading(true);
    try {
      const historicalProgressData = studentData.progressHistory.map(p => ({
        date: p.date,
        progress: p.progress,
      }));
      const result = await personalizedStreakGoal({ studentId: studentData.id, historicalProgressData });
      setGoal(result);
    } catch (error) {
      console.error('Error fetching personalized goal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a personalized goal.",
      });
    }
    setIsGoalLoading(false);
  };
  
  const handleSimulateNotification = async () => {
    if (!user) return;
    setIsNotificationLoading(true);
    try {
      const lastActivity = studentData.progressHistory[0]?.date || format(subDays(new Date(), 3), 'yyyy-MM-dd');
      const result = await intelligentStreakLossNotification({
        studentId: user.uid,
        streakLength: studentData.streak,
        lastActivity: lastActivity,
        notificationHistory: [],
      });

      toast({
        title: `Simulated ${result.deliveryMethod} Notification`,
        description: result.notificationMessage,
      });

    } catch (error) {
      console.error('Error simulating notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not simulate the notification.",
      });
    }
    setIsNotificationLoading(false);
  };

  const chartData = generateChartData(studentData.progressHistory);

  if (isProgressLoading) {
    return <div className="flex h-full w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
    </div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 grid auto-rows-min gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <StreakCard title="Current Streak" streak={studentData.streak} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.longestStreak} days</div>
              <p className="text-xs text-muted-foreground">Your personal best!</p>
            </CardContent>
          </Card>
        </div>
        <StreakChart data={chartData} />
      </div>

      <div className="lg:col-span-2 grid auto-rows-min gap-4 md:gap-8">
        <ProgressForm onSubmit={handleProgressSubmit} />
        <GoalCard 
          goal={goal} 
          isLoading={isGoalLoading} 
          onGetGoal={handleGetGoal} 
        />
        <NotificationCard
          isLoading={isNotificationLoading}
          onSimulate={handleSimulateNotification}
        />
      </div>
    </div>
  );
}
