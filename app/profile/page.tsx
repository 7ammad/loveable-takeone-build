'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TalentProfile from '@/components/profile/TalentProfile';
import HirerProfile from '@/components/profile/HirerProfile';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {user?.role === 'talent' && <TalentProfile />}
        {user?.role === 'caster' && <HirerProfile />}
      </div>
    </ProtectedRoute>
  );
}

