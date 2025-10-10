'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Briefcase,
  Users,
  Share2,
  Bookmark,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { LandingHeader } from '@/components/Header';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/lib/contexts/auth-context';

export default function CastingCallDetailPage() {
  const params = useParams();
  const { user } = useAuth();

  // Mock data - replace with real API call using params.id
  const castingCall = {
    id: params.id,
    title: 'Lead Actor for Historical Drama Series',
    company: 'MBC Studios',
    location: 'Riyadh',
    compensation: 'SAR 50,000 - 80,000',
    deadline: '2025-10-15',
    postedDate: '2025-10-01',
    description: `We are seeking an experienced male actor for a leading role in our upcoming historical drama series set in the Arabian Peninsula during the 18th century. This is a major production with a substantial budget and wide distribution across multiple platforms.

The series will consist of 20 episodes, each 45 minutes long, and will be filmed primarily in Riyadh with some location shoots in other Saudi cities. The project is scheduled to begin production in January 2026.`,
    requirements: `• Male, 30-45 years old
• Fluent in Arabic (classical Arabic is a plus)
• Previous experience in period dramas
• Strong physical fitness for action sequences
• Comfortable with horseback riding
• Available for 6-month production period`,
    responsibilities: `• Lead role with extensive screen time
• Collaborative work with international crew
• Promotion and media appearances
• Attend script reading sessions
• Participate in costume fittings and rehearsals`,
    projectDetails: {
      type: 'Television Series',
      episodes: 20,
      duration: '45 minutes per episode',
      productionStart: 'January 2026',
      shootingLocations: 'Riyadh, Jeddah, Al-Ula',
      commitment: '6 months',
    },
    benefits: [
      'Competitive compensation package',
      'Travel and accommodation covered',
      'Professional crew and production team',
      'Wide distribution across major platforms',
      'Career advancement opportunity',
    ],
    isVerified: true,
    daysLeft: 5,
    applicants: 15,
    views: 234,
    companyInfo: {
      name: 'MBC Studios',
      description: 'Leading production company in Saudi Arabia with over 15 years of experience in television and film production.',
      verified: true,
      pastProductions: 12,
      activeProjects: 3,
    },
  };

  const similarOpportunities = [
    { id: 2, title: 'Voice Actor for Animated Series', company: 'Manga Productions', deadline: '10 days left' },
    { id: 3, title: 'Supporting Role in Comedy Series', company: 'Telfaz11', deadline: '3 days left' },
  ];

  return (
    <>
      {user ? <DashboardNav /> : <LandingHeader />}
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/casting-calls" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Casting Calls
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <div className={`h-2 ${castingCall.isVerified ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`} />
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {castingCall.title}
                    </h1>
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      {castingCall.company}
                      {castingCall.isVerified && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">Verified</span>
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Key Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{castingCall.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Compensation</p>
                      <p className="text-sm font-medium">SAR 50-80K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-sm font-medium text-orange-600">{castingCall.daysLeft} days left</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Applicants</p>
                      <p className="text-sm font-medium">{castingCall.applicants}</p>
                    </div>
                  </div>
                </div>

                {/* Apply Button - Only for Talent */}
                {user?.role === 'talent' && (
                  <div className="mt-6">
                    <Link href={`/casting-calls/${params.id}/apply`}>
                      <Button size="lg" className="w-full md:w-auto">
                        Apply for This Role
                      </Button>
                    </Link>
                  </div>
                )}
                
                {/* Edit Button - Only for Casters */}
                {user?.role === 'caster' && (
                  <div className="mt-6 flex gap-3">
                    <Link href={`/casting-calls/${params.id}/edit`}>
                      <Button size="lg" className="w-full md:w-auto">
                        Edit Casting Call
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="w-full md:w-auto">
                      View Applications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  {castingCall.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {castingCall.requirements.split('\n').filter(r => r.trim()).map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{req.replace('•', '').trim()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(castingCall.projectDetails).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {castingCall.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deadline</span>
                  <span className="text-sm font-medium">{new Date(castingCall.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm font-medium">{new Date(castingCall.postedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="text-sm font-medium">{castingCall.views}</span>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {castingCall.companyInfo.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-1">
                      {castingCall.companyInfo.name}
                      {castingCall.companyInfo.verified && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground">{castingCall.companyInfo.activeProjects} active projects</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{castingCall.companyInfo.description}</p>
                <Button variant="outline" className="w-full" size="sm">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Similar Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarOpportunities.map((opp) => (
                  <Link key={opp.id} href={`/casting-calls/${opp.id}`}>
                    <div className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-sm text-foreground mb-1">{opp.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{opp.company}</p>
                      <span className="text-xs text-orange-600 font-medium">{opp.deadline}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Report */}
            <Card className="border-destructive/20">
              <CardContent className="p-4">
                <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive">
                  Report This Posting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

        {/* Sticky Apply Button (Mobile) - Only for Talent */}
        {user?.role === 'talent' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
            <Link href={`/casting-calls/${params.id}/apply`} className="block">
              <Button size="lg" className="w-full">
                Apply for This Role
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

