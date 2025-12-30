'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Sparkles, Lightbulb, Download } from 'lucide-react';
import type { WeeklyPerformanceReviewOutput } from '@/ai/flows/weekly-performance-review';
import { ScrollArea } from '../ui/scroll-area';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type WeeklyReportCardProps = {
  onGenerateReport: () => Promise<WeeklyPerformanceReviewOutput>;
};

export function WeeklyReportCard({ onGenerateReport }: WeeklyReportCardProps) {
  const [report, setReport] = useState<WeeklyPerformanceReviewOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setIsOpen(true);
    const result = await onGenerateReport();
    setReport(result);
    setIsLoading(false);
  };
  
  const handleDownloadPdf = async () => {
    if (!reportContentRef.current) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(reportContentRef.current, {
            scale: 2, // Higher scale for better quality
            useCORS: true, 
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('weekly-performance-report.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance Review</CardTitle>
        <CardDescription>Get an AI-powered summary of your week and tips for the next.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              <BookCheck />
              Generate My Weekly Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Your Weekly Performance Review</DialogTitle>
              <DialogDescription>
                Here's a breakdown of your last week and some personalized suggestions.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-muted-foreground">
                  <Sparkles className="h-10 w-10 animate-pulse text-primary" />
                  <span>Generating your report... this may take a moment.</span>
                </div>
              ) : report ? (
                <div ref={reportContentRef} className="space-y-6 p-4 bg-background">
                  <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: report.reportSummary.replace(/\n/g, '<br />') }} />

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        Suggestions for Next Week
                    </h3>
                    <ul className="space-y-3">
                      {report.nextWeekSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-accent font-bold">&rarr;</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>Could not generate the report. Please try again.</p>
              )}
            </ScrollArea>
            {report && !isLoading && (
              <DialogFooter>
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <Sparkles className="animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download />
                      Save as PDF
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
