'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { TalentProfile } from '@/lib/types';
import { calculateTalentProfileCompletion } from '@/lib/utils/profile-completion';

export default function TalentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get<{ success: boolean; data: TalentProfile | null }>('/api/v1/profiles/me');
        if (res.data.success) setProfile(res.data.data || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completion = calculateTalentProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <Link href="/profile/edit">
              <Button>Edit Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !profile ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Complete your profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You haven\'t created a profile yet. Create your talent profile so casters can discover you.
              </p>
              <Link href="/profile/edit">
                <Button className="w-full">
                  Go to profile editor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                        {(profile.stageName || user?.name || 'U').charAt(0)}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mt-4">
                      {profile.stageName || user?.name}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>

                    <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Profile Completion</span>
                        <span className="text-sm font-bold text-primary">{completion.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${completion.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Stage Name</p>
                      <p className="text-foreground font-medium">{profile.stageName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="text-foreground font-medium">{profile.city || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="text-foreground font-medium">{profile.gender || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="text-foreground font-medium">{profile.dateOfBirth || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attributes & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground">Height</p>
                      <p className="text-foreground font-medium">{profile.height ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Eye Color</p>
                      <p className="text-foreground font-medium">{profile.eyeColor || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hair Color</p>
                      <p className="text-foreground font-medium">{profile.hairColor || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(profile.skills || []).length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        (profile.skills || []).map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(profile.languages || []).length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        (profile.languages || []).map((l, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">
                            {l}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

