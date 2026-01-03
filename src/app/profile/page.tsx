'use client';

import { useState } from 'react';
import { initialStudentData } from '@/lib/mock-data';
import { Header } from '@/components/streak-keeper/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ALL_BADGES, getXpForLevel } from '@/lib/gamification';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Flame, Star, Trophy, Footprints, Clock, Calendar } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
    Flame,
    Trophy,
    Star,
    Crown,
    Footprints,
    Clock,
    Calendar,
};

export default function ProfilePage() {
  const [studentData] = useState(initialStudentData);

  const xpForCurrentLevel = getXpForLevel(studentData.level);
  const xpForNextLevel = getXpForLevel(studentData.level + 1);
  const xpProgress = studentData.xp - xpForCurrentLevel;
  const xpToNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100;

  const earnedBadges = ALL_BADGES.filter(badge => studentData.badges.includes(badge.id));
  const unearnedBadges = ALL_BADGES.filter(badge => !studentData.badges.includes(badge.id));

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-12">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary shadow-lg">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback>{studentData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{studentData.name}</CardTitle>
            <CardDescription>{studentData.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Level and XP Section */}
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">Level {studentData.level}</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-4">
                      <Progress value={progressPercentage} className="w-full" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{studentData.xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground">
                {xpForNextLevel - studentData.xp > 0 ? `${(xpForNextLevel - studentData.xp).toLocaleString()} XP to next level` : "Max level reached!"}
              </p>
            </div>
            
            <Separator />

            {/* Badges Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">Earned Badges ({earnedBadges.length})</h2>
              {earnedBadges.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  <TooltipProvider>
                    {earnedBadges.map(badge => {
                      const Icon = iconMap[badge.icon] || Star;
                      return (
                        <Tooltip key={badge.id}>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-2 p-3 bg-accent/10 rounded-lg border-2 border-accent/50 w-28 text-center">
                              <Icon className="h-10 w-10 text-accent" />
                              <span className="text-xs font-medium text-accent-foreground">{badge.name}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-bold">{badge.name}</p>
                            <p>{badge.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No badges earned yet. Keep learning to unlock them!</p>
              )}
            </div>

            {unearnedBadges.length > 0 && (
              <>
                <Separator />
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-center">Locked Badges</h2>
                    <div className="flex flex-wrap justify-center gap-4 opacity-50">
                    <TooltipProvider>
                        {unearnedBadges.map(badge => {
                        const Icon = iconMap[badge.icon] || Star;
                        return (
                            <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-lg w-28 text-center">
                                <Icon className="h-10 w-10 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">{badge.name}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{badge.name}</p>
                                <p>{badge.description}</p>
                            </TooltipContent>
                            </Tooltip>
                        );
                        })}
                    </TooltipProvider>
                    </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
