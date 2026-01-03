'use client';

import { Header } from '@/components/streak-keeper/Header';
import { Dashboard } from '@/components/streak-keeper/Dashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <Dashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
