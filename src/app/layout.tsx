'use client';

import { useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { getMotivationOfTheDay } from '@/ai/flows/motivation-of-the-day';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const fetchMotivation = async () => {
      try {
        const motivation = await getMotivationOfTheDay();
        document.title = `"${motivation.quote}" - Streak Keeper`;
      } catch (error) {
        console.error('Failed to fetch motivation for title:', error);
        document.title = 'Streak Keeper';
      }
    };
    fetchMotivation();
  }, []);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="font-body antialiased h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
