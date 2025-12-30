'use client';

import type { PersonalizedStreakGoalOutput } from '@/ai/flows/personalized-streak-goal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Target } from 'lucide-react';

type GoalCardProps = {
  goal: PersonalizedStreakGoalOutput | null;
  isLoading: boolean;
  onGetGoal: () => void;
};

export function GoalCard({ goal, isLoading, onGetGoal }: GoalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Goal</CardTitle>
        <CardDescription>Let AI suggest a challenging but achievable goal for you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Sparkles className="h-8 w-8 animate-pulse" />
            <span>Generating your goal...</span>
          </div>
        ) : goal ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-accent" />
              <p className="text-2xl font-bold">{goal.suggestedStreakGoal} hours/day</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">Why this goal?</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Goal Reasoning</DialogTitle>
                  <DialogDescription>
                    {goal.reasoning}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button onClick={onGetGoal} variant="secondary" size="sm" className="mt-2">
                <Sparkles />
                Generate a new goal
            </Button>
          </div>
        ) : (
          <Button onClick={onGetGoal}>
            <Sparkles />
            Generate My Goal
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
