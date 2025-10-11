'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const PROMPT_TIMEOUT = 30 * 1000; // 30 seconds before logout

export function useIdleTimer() {
  const router = useRouter();
  const { toast } = useToast();
  const [isIdle, setIsIdle] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Failed to logout on server:', error);
    } finally {
      router.push('/login?reason=session_expired');
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (isIdle) {
      setIsIdle(false);
      toast({
        title: 'Session Restored',
        description: 'Welcome back!',
      });
    }
    
    if (window.idleTimer) {
      clearTimeout(window.idleTimer);
    }
    if (window.promptTimer) {
        clearTimeout(window.promptTimer);
    }

    window.idleTimer = setTimeout(() => {
      setIsIdle(true);
      toast({
        title: 'Are you still there?',
        description: `You've been inactive for a while. You will be logged out in ${PROMPT_TIMEOUT / 1000} seconds.`,
        variant: 'destructive',
      });
      window.promptTimer = setTimeout(handleLogout, PROMPT_TIMEOUT);
    }, INACTIVITY_TIMEOUT);

  }, [isIdle, toast, handleLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (window.idleTimer) clearTimeout(window.idleTimer);
      if (window.promptTimer) clearTimeout(window.promptTimer);
    };
  }, [resetTimer]);

  return isIdle;
}

// Augment the Window interface to include our timer IDs
declare global {
  interface Window {
    idleTimer?: NodeJS.Timeout;
    promptTimer?: NodeJS.Timeout;
  }
}
