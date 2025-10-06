'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import TalentDashboard from '@/components/dashboard/TalentDashboard';
import HirerDashboard from '@/components/dashboard/HirerDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        {user?.role === 'talent' && <TalentDashboard />}
        {user?.role === 'caster' && <HirerDashboard />}
      </div>
    </ProtectedRoute>
  );
}

