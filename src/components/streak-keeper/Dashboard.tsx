'use client';

import { useState } from 'react';
import type { StudentData, ProgressEntry } from '@/lib/types';
import { format, subDays, isYesterday, isToday, differenceInCalendarDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { personalizedStreakGoal, type PersonalizedStreakGoalOutput } from '@/ai/flows/personalized-streak-goal';
import { intelligentStreakLossNotification, type NotificationOutput } from '@/ai/flows/intelligent-streak-loss-notification';

import { StreakCard } from './StreakCard';
import { StreakChart } from './StreakChart';
import { ProgressForm } from './ProgressForm';
import { GoalCard } from './GoalCard';
import { NotificationCard } from './NotificationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

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

  const handleProgressSubmit = (data: { progress: number; activity: string }) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newProgressHistory = [...studentData.progressHistory];
    const lastEntry = newProgressHistory.length > 0 ? newProgressHistory[0] : null;

    let newStreak = studentData.streak;
    
    if (lastEntry) {
      const lastEntryDate = new Date(lastEntry.date);
      if (isToday(lastEntryDate)) {
        // Already logged today, so update entry
        newProgressHistory[0] = { ...lastEntry, ...data };
      } else if (isYesterday(lastEntryDate)) {
        // Logged yesterday, increment streak
        newStreak++;
        newProgressHistory.unshift({ date: todayStr, ...data });
      } else {
        // Missed days, reset streak
        newStreak = 1;
        newProgressHistory.unshift({ date: todayStr, ...data });
      }
    } else {
      // First ever entry
      newStreak = 1;
      newProgressHistory.unshift({ date: todayStr, ...data });
    }

    const newLongestStreak = Math.max(studentData.longestStreak, newStreak);

    setStudentData({
      ...studentData,
      streak: newStreak,
      longestStreak: newLongestStreak,
      progressHistory: newProgressHistory,
    });
    
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
    setIsNotificationLoading(true);
    try {
      const lastActivity = studentData.progressHistory[0]?.date || format(subDays(new Date(), 3), 'yyyy-MM-dd');
      const result = await intelligentStreakLossNotification({
        studentId: studentData.id,
        streakLength: studentData.streak,
        lastActivity: lastActivity,
        notificationHistory: studentData.notificationHistory,
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
