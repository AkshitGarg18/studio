'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';

import { Header } from '@/components/streak-keeper/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ALL_BADGES, getXpForLevel } from '@/lib/gamification';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Flame, Star, Trophy, Footprints, Clock, Calendar } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { collection } from 'firebase/firestore';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
    Flame,
    Trophy,
    Star,
    Crown,
    Footprints,
    Clock,
    Calendar,
};

function ProfilePageContent() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const earnedBadges = useMemo(() => {
    if (!userProfile) return [];
    return ALL_BADGES.filter(badge => userProfile.badges.includes(badge.id));
  }, [userProfile]);

  const unearnedBadges = useMemo(() => {
    if (!userProfile) return ALL_BADGES;
    return ALL_BADGES.filter(badge => !userProfile.badges.includes(badge.id));
  }, [userProfile]);

  if (isProfileLoading || !userProfile) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-12">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <Skeleton className="h-24 w-full" />
                    <Separator />
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }

  const { level, xp, badges } = userProfile;
  const xpForCurrentLevel = getXpForLevel(level);
  const xpForNextLevel = getXpForLevel(level + 1);
  const xpProgress = xp - xpForCurrentLevel;
  const xpToNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100;
  const isMaxLevel = level >= 100;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 lg:p-12">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary shadow-lg">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback>{userProfile.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
            <CardDescription>{userProfile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">Level {level}</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-4">
                      <Progress value={progressPercentage} className="w-full" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground">
                {!isMaxLevel ? `${(xpForNextLevel - xp).toLocaleString()} XP to next level` : "Max level reached!"}
              </p>
            </div>
            
            <Separator />

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


export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    )
}
