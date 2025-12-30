'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Sparkles } from 'lucide-react';

type NotificationCardProps = {
  isLoading: boolean;
  onSimulate: () => void;
};

export function NotificationCard({ isLoading, onSimulate }: NotificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Notifications</CardTitle>
        <CardDescription>
          Our AI sends smart reminders if you're about to lose your streak.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            <span>Simulating notification...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <BellRing className="h-10 w-10 text-primary" />
             <Button onClick={onSimulate} variant="outline">
                <Sparkles />
                Simulate Streak-Loss Alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
