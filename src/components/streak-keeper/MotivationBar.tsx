'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { getMotivationOfTheDay } from '@/ai/flows/motivation-of-the-day';
import { useToast } from '@/hooks/use-toast';

export function MotivationBar() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetMotivation = async () => {
    setIsLoading(true);
    try {
      const result = await getMotivationOfTheDay();
      toast({
        title: `"${result.quote}"`,
        description: `- ${result.author}`,
      });
    } catch (error) {
      console.error('Error fetching motivation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a motivational quote.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center gap-4 border-b bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
      <p className="text-muted-foreground">Get your daily dose of inspiration!</p>
      <Button onClick={handleGetMotivation} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? (
          <>
            <Sparkles className="animate-pulse" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles />
            Generate Quote
          </>
        )}
      </Button>
    </div>
  );
}
