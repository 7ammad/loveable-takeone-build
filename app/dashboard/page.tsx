'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TalentDashboard from '@/components/dashboard/TalentDashboard';
import HirerDashboard from '@/components/dashboard/HirerDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {user?.role === 'talent' && <TalentDashboard />}
        {user?.role === 'caster' && <HirerDashboard />}
      </div>
    </ProtectedRoute>
  );
}

