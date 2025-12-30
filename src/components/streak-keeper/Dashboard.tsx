'use client';

import { useState, useEffect } from 'react';
import type { StudentData, ProgressEntry } from '@/lib/types';
import { format, subDays, isYesterday, isToday, parseISO, endOfToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { personalizedStreakGoal, type PersonalizedStreakGoalOutput } from '@/ai/flows/personalized-streak-goal';
import { intelligentStreakLossNotification } from '@/ai/flows/intelligent-streak-loss-notification';

import { initialStudentData } from '@/lib/mock-data';
import { StreakCard } from './StreakCard';
import { StreakChart } from './StreakChart';
import { ProgressForm } from './ProgressForm';
import { GoalCard } from './GoalCard';
import { NotificationCard } from './NotificationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const generateChartData = (progressHistory: ProgressEntry[], days: number) => {
  const data: { date: string; progress: number }[] = [];
  const today = new Date();
  const progressMap = new Map(progressHistory.map(p => [p.date, p.progress]));

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    data.push({
      date: date.toISOString(), // Use ISO string for reliable parsing
      progress: progressMap.get(dateString) || 0,
    });
  }
  return data;
};

export function Dashboard() {
  const [studentData, setStudentData] = useState<StudentData>(initialStudentData);
  const [goal, setGoal] = useState<PersonalizedStreakGoalOutput | null>(null);
  const [isGoalLoading, setIsGoalLoading] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const { toast } = useToast();
  const [streakEndTime, setStreakEndTime] = useState<Date | null>(null);

  useEffect(() => {
    // Sort progress history on initial load
    const sortedHistory = [...studentData.progressHistory].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    const lastEntry = sortedHistory[0];

    if (studentData.streak > 0 && lastEntry) {
      const lastEntryDate = parseISO(lastEntry.date);
      if (isYesterday(lastEntryDate)) {
        // If the last entry was yesterday, the streak ends at midnight today.
        setStreakEndTime(endOfToday());
      } else {
        // If the last entry was today or earlier, no immediate deadline.
        setStreakEndTime(null);
      }
    } else {
      setStreakEndTime(null);
    }
    
    setStudentData(prev => ({ ...prev, progressHistory: sortedHistory }));
  }, [studentData.streak]);

  const handleProgressSubmit = (data: { progress: number; activity: string }) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Create a new progress entry
    const newProgressEntry: ProgressEntry = {
      date: todayStr,
      ...data,
      userId: studentData.id,
    };

    const updatedHistory = [newProgressEntry, ...studentData.progressHistory.filter(p => p.date !== todayStr)];

    const lastEntry = studentData.progressHistory.length > 0 ? studentData.progressHistory[0] : null;

    let newStreak = studentData.streak;
    
    if (lastEntry) {
      const lastEntryDate = parseISO(lastEntry.date);
      if (isToday(lastEntryDate)) {
        // Already logged today, streak doesn't change
      } else if (isYesterday(lastEntryDate)) {
        newStreak++;
      } else {
        newStreak = 1; // Streak is broken, reset to 1
      }
    } else {
      newStreak = 1; // First entry
    }

    const newLongestStreak = Math.max(studentData.longestStreak, newStreak);
    
    setStudentData(prev => ({
      ...prev,
      streak: newStreak,
      longestStreak: newLongestStreak,
      progressHistory: updatedHistory,
    }));

    setStreakEndTime(null); // Progress logged, so remove timer
    
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

  const chartData7Days = generateChartData(studentData.progressHistory, 7);
  const longestStreakEmoji = studentData.longestStreak > 10 ? '🏆' : studentData.longestStreak > 5 ? '🏅' : '🎉';

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 grid auto-rows-min gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <StreakCard 
            title="Current Streak" 
            streak={studentData.streak}
            streakEndDate={streakEndTime}
          />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.longestStreak} days {longestStreakEmoji}</div>
              <p className="text-xs text-muted-foreground">Your personal best!</p>
            </CardContent>
          </Card>
        </div>
        <StreakChart data={chartData7Days} />
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
