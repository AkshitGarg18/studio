'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.1 76.1c-24.1-23.4-58.2-37.9-96.8-37.9-80.9 0-146.5 65.6-146.5 146.5s65.6 146.5 146.5 146.5c89.9 0 130.6-67.2 135.2-101.3H248v-90.9h239.3c5.3 22.9 8.7 48.8 8.7 78.5z"
      />
    </svg>
  );

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isProcessingSignIn, setIsProcessingSignIn] = useState(true);

  useEffect(() => {
    // This effect handles the redirect result after Google sign-in
    const processRedirect = async () => {
      if (!auth || !firestore) return;

      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const newUserProfile: UserProfile = {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: null,
              level: 1,
              xp: 0,
              badges: [],
            };
            await setDoc(userDocRef, newUserProfile);
          }
          // Redirect to home page after successful profile check/creation
          router.push('/');
        } else {
            setIsProcessingSignIn(false);
        }
      } catch (error) {
        console.error('Error during sign-in redirect:', error);
        setIsProcessingSignIn(false);
      }
    };

    // Only process redirect if not loading and services are available
    if (!isUserLoading && auth && firestore) {
        processRedirect();
    }
  }, [auth, firestore, isUserLoading, router]);

  useEffect(() => {
    // This effect redirects already logged-in users to the homepage
    if (!isUserLoading && !isProcessingSignIn && user) {
      router.push('/');
    }
  }, [user, isUserLoading, isProcessingSignIn, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect instead of signInWithPopup
    await signInWithRedirect(auth, provider);
  };
  
  if (isUserLoading || isProcessingSignIn || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Flame className="h-12 w-12 animate-pulse text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Flame className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="mt-4 text-2xl">Welcome to Streak Keeper</CardTitle>
          <CardDescription>Sign in to track your progress and build your streak.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full">
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
