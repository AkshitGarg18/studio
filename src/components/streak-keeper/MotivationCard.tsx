'use client';

import { useState } from 'react';
import type { MotivationOfTheDayOutput } from '@/ai/flows/motivation-of-the-day';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BrainCircuit } from 'lucide-react';

type MotivationCardProps = {
  onGetMotivation: () => Promise<MotivationOfTheDayOutput>;
};

export function MotivationCard({ onGetMotivation }: MotivationCardProps) {
  const [motivation, setMotivation] = useState<MotivationOfTheDayOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetMotivation = async () => {
    setIsLoading(true);
    setIsOpen(true);
    const result = await onGetMotivation();
    setMotivation(result);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Motivation of the Day</CardTitle>
        <CardDescription>Get a dose of inspiration to fuel your learning journey.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleGetMotivation} disabled={isLoading}>
              <BrainCircuit />
              Get Today's Motivation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Daily Dose of Motivation</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                  <span>Finding the right words...</span>
                </div>
              ) : motivation ? (
                <blockquote className="space-y-4">
                  <p className="text-lg font-semibold italic">"{motivation.quote}"</p>
                  <footer className="text-right text-sm text-muted-foreground">- {motivation.author}</footer>
                </blockquote>
              ) : (
                <p>Could not load a quote. Please try again.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
