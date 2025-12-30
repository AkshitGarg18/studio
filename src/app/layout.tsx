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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
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
