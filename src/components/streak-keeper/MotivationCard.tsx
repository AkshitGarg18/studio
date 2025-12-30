'use client';

import { useState, useEffect } from 'react';
import type { MotivationOfTheDayOutput } from '@/ai/flows/motivation-of-the-day';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

type MotivationCardProps = {
  onGetMotivation: () => Promise<MotivationOfTheDayOutput>;
};

export function MotivationCard({ onGetMotivation }: MotivationCardProps) {
  const [motivation, setMotivation] = useState<MotivationOfTheDayOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMotivation = async () => {
      setIsLoading(true);
      const result = await onGetMotivation();
      setMotivation(result);
      setIsLoading(false);
    };

    fetchMotivation();
  }, [onGetMotivation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Motivation of the Day</CardTitle>
        <CardDescription>Your daily dose of inspiration.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center min-h-[100px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            <span>Finding the right words...</span>
          </div>
        ) : motivation ? (
          <blockquote className="space-y-2">
            <p className="text-base font-semibold italic">"{motivation.quote}"</p>
            <footer className="text-right text-sm text-muted-foreground">- {motivation.author}</footer>
          </blockquote>
        ) : (
          <p>Could not load a quote. Please try again later.</p>
        )}
      </CardContent>
    </Card>
  );
}
