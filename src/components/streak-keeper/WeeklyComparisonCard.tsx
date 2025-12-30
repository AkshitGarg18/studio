'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowDown, ArrowUp, CalendarRange, Lightbulb, Sparkles } from 'lucide-react';
import type { getPerformanceTips, PerformanceTipsOutput } from '@/ai/flows/performance-improvement-tips';
import type { ProgressEntry } from '@/lib/types';


type WeeklyComparisonCardProps = {
  currentWeekHours: number;
  previousWeekHours: number;
  onGetTips: (currentWeekProgress: number, previousWeekProgress: number) => Promise<PerformanceTipsOutput>;
};

export function WeeklyComparisonCard({
  currentWeekHours,
  previousWeekHours,
  onGetTips,
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

  const [tips, setTips] = useState<PerformanceTipsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetTips = async () => {
    setIsLoading(true);
    const result = await onGetTips(currentWeekHours, previousWeekHours);
    setTips(result);
    setIsLoading(false);
  };

  const showTipsButton = !isPositive && currentWeekHours < previousWeekHours;

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
         {showTipsButton && (
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleGetTips}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Get Tips
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Personalized Performance Tips</DialogTitle>
                <DialogDescription>
                  Here are some AI-generated suggestions to help you catch up and beat last week's performance.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                    <span>Generating your tips...</span>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {tips?.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 mt-0.5 text-accent flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
