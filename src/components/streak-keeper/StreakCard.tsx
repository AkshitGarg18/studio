'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

type StreakCardProps = {
  title: string;
  streak: number;
};

export function StreakCard({ title, streak }: StreakCardProps) {
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
          {displayStreak} days
        </div>
        <p className="text-xs text-muted-foreground">
          {streak > 0 ? 'Keep it up!' : 'Start your streak today!'}
        </p>
      </CardContent>
    </Card>
  );
}
