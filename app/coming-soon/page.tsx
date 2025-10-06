'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { Suspense } from 'react';

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const pageName = searchParams.get('page') || 'This Page';

  return (
    <>
      {/* Icon */}
      <div className="mb-8">
        <Clock className="w-24 h-24 text-primary mx-auto" />
      </div>

      {/* Content */}
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
        Coming Soon
      </h1>
      
      <p className="text-xl text-gray-300 mb-3">
        <span className="text-primary font-semibold">{pageName}</span> is under construction
      </p>
      
      <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto">
        We&apos;re working hard to bring you this feature. Check back soon for updates!
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Link href="/casting-calls">
          <Button size="lg" variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
            Browse Opportunities
          </Button>
        </Link>
      </div>

      {/* Links to explore */}
      <div className="mt-16 pt-8 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-4">In the meantime, explore:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/talent" className="text-primary hover:underline">
            Discover Talent
          </Link>
          <Link href="/casting-calls" className="text-primary hover:underline">
            Find Jobs
          </Link>
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ComingSoonPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-2xl w-full text-center">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <ComingSoonContent />
        </Suspense>
      </div>
    </div>
  );
}

