'use client';

import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Badge } from '@/lib/types';
import { Download, Sparkles, Star, Crown, Flame, Footprints, Clock, Calendar } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
    Flame,
    Crown,
    Star,
    Footprints,
    Clock,
    Calendar,
};

type ShareBadgeDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  badge: Badge | null;
  userName: string;
};

export function ShareBadgeDialog({ isOpen, setIsOpen, badge, userName }: ShareBadgeDialogProps) {
  const shareableRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!shareableRef.current) return;
    setIsDownloading(true);
    try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(shareableRef.current, { 
            scale: 2, // Higher resolution
            backgroundColor: null, // Transparent background
            useCORS: true,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `streak-keeper-badge-${badge?.id ?? 'achievement'}.png`;
        link.click();
    } catch (error) {
        console.error("Failed to download badge:", error)
    } finally {
        setIsDownloading(false);
        setIsOpen(false);
    }
  };

  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Star;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Achievement!</DialogTitle>
          <DialogDescription>
            You've earned a new badge! Download the image below and share it with your friends.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-8">
            <div 
                ref={shareableRef}
                className="w-[300px] h-[300px] bg-gradient-to-br from-primary/80 to-accent/80 p-6 rounded-lg shadow-2xl flex flex-col items-center justify-center text-center text-primary-foreground relative overflow-hidden"
            >
                <Icon className="h-20 w-20 mb-4 drop-shadow-lg" />
                <h3 className="text-2xl font-bold drop-shadow-md">{badge.name}</h3>
                <p className="text-sm opacity-90 drop-shadow-sm">{badge.description}</p>
                <p className="mt-6 text-lg font-semibold border-t border-primary-foreground/30 pt-4 w-full">
                    Awarded to: {userName}
                </p>
                <div className='absolute -bottom-4 -right-4'>
                    <Sparkles className="h-16 w-16 text-primary-foreground/20" />
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Sparkles className="animate-pulse mr-2" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="mr-2" />
                <span>Download PNG</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
