'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, CalendarRange } from 'lucide-react';

type WeeklyComparisonCardProps = {
  currentWeekHours: number;
  previousWeekHours: number;
};

export function WeeklyComparisonCard({
  currentWeekHours,
  previousWeekHours,
}: WeeklyComparisonCardProps) {
  const difference = currentWeekHours - previousWeekHours;
  const percentageChange =
    previousWeekHours > 0
      ? ((difference / previousWeekHours) * 100).toFixed(0)
      : currentWeekHours > 0
      ? 100 // If previous was 0 and current is > 0, it's a 100% increase from nothing.
      : 0; // If both are 0, no change.
  
  const isPositive = difference >= 0;
  const changeText = isPositive ? `+${percentageChange}%` : `${percentageChange}%`;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Weekly Comparison</CardTitle>
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currentWeekHours.toFixed(1)} hrs</div>
        <div className="flex items-center text-xs">
          {previousWeekHours > 0 || currentWeekHours > 0 ? (
            <>
              <span className={`mr-1 font-semibold ${changeColor}`}>{changeText}</span>
              <TrendIcon className={`h-4 w-4 ${changeColor}`} />
              <span className="ml-1 text-muted-foreground">from last week</span>
            </>
          ) : (
             <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
