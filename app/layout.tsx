import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { IdleTimerProvider } from '@/components/auth/IdleTimerProvider';
// Digital Twin is initialized via instrumentation.ts hook

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TakeOne",
  description: "Saudi Casting Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <IdleTimerProvider />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
