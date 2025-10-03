'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TalentProfileForm from '@/components/profile/TalentProfileForm';
import HirerProfileForm from '@/components/profile/HirerProfileForm';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-6">
            <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">Update your profile information</p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {user?.role === 'talent' ? <TalentProfileForm /> : <HirerProfileForm />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

