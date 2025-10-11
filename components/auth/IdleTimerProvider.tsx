'use client';

import { useIdleTimer } from '@/hooks/use-idle-timer';

export function IdleTimerProvider() {
  // Activate the idle timer for all authenticated users
  useIdleTimer();

  return null; // This component does not render anything.
}
