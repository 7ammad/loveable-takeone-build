'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import TalentProfileView from '@/components/profile/TalentProfileView';
import HirerProfile from '@/components/profile/HirerProfile';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        {user?.role === 'talent' && <TalentProfileView />}
        {user?.role === 'caster' && <HirerProfile />}
      </div>
    </ProtectedRoute>
  );
}

