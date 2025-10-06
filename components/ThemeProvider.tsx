'use client';

import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Tailwind-powered app: no MUI theme provider needed.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
