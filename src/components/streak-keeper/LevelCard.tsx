'use client';

import { getXpForLevel } from '@/lib/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type LevelCardProps = {
  level: number;
  xp: number;
};

export function LevelCard({ level, xp }: LevelCardProps) {
  const xpForCurrentLevel = getXpForLevel(level);
  const xpForNextLevel = getXpForLevel(level + 1);
  const xpProgress = xp - xpForCurrentLevel;
  const xpToNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Level</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">Level {level}</div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Progress value={progressPercentage} className="mt-2 h-2" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
