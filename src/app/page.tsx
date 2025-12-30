'use client';

import { Header } from '@/components/streak-keeper/Header';
import { Dashboard } from '@/components/streak-keeper/Dashboard';
import { MotivationBar } from '@/components/streak-keeper/MotivationBar';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <MotivationBar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
