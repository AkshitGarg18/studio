'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { intervalToDuration, formatDuration } from 'date-fns';

type StreakCardProps = {
  title: string;
  streak: number;
  streakEndDate: Date | null;
};

const getStreakEmoji = (streak: number) => {
  if (streak >= 10) return '🚀';
  if (streak >= 5) return '🔥🔥';
  if (streak > 0) return '🔥';
  return '😞';
};

const Countdown = ({ to }: { to: Date }) => {
  const [duration, setDuration] = useState(
    intervalToDuration({ start: new Date(), end: to })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newDuration = intervalToDuration({ start: new Date(), end: to });
      if (newDuration.seconds! < 0) {
        setDuration({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setDuration(newDuration);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [to]);

  const timeLeftFormatted = formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    zero: true,
    delimiter: ':',
    padding: 'left',
  });
  
  const showTimer = (duration.hours ?? 0) < 5;

  if (!showTimer) return null;

  return (
    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-destructive">
      <Timer className="h-4 w-4" />
      <span>Streak ends in: {timeLeftFormatted}</span>
    </div>
  );
};


export function StreakCard({ title, streak, streakEndDate }: StreakCardProps) {
  const [displayStreak, setDisplayStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (streak !== displayStreak) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayStreak(streak);
        setIsAnimating(false);
      }, 300);
    }
  }, [streak, displayStreak]);

  const emoji = getStreakEmoji(displayStreak);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Flame className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div 
          className={`text-2xl font-bold transition-transform duration-300 ease-in-out ${isAnimating ? 'scale-125' : 'scale-100'}`}
        >
          {displayStreak} days {emoji}
        </div>
        <p className="text-xs text-muted-foreground">
          {streak > 0 ? 'Keep it up!' : 'Start your streak today!'}
        </p>
        {streakEndDate && <Countdown to={streakEndDate} />}
      </CardContent>
    </Card>
  );
}
