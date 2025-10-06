'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Star, 
  CheckCircle2,
  Mail,
  Calendar,
  Award,
  Briefcase,
  Languages,
  ArrowLeft,
  ExternalLink,
  Instagram
} from 'lucide-react';
import Link from 'next/link';
import { LandingHeader } from '@/components/Header';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/lib/contexts/auth-context';

export default function TalentDetailPage() {
  const params = useParams();
  const { user } = useAuth();

  // Mock data - replace with real API call using params.id
  const talent = {
    id: params.id,
    name: 'Sarah Al-Ahmed',
    stageName: 'Sarah A.',
    location: 'Riyadh',
    age: 28,
    gender: 'Female',
    rating: 4.8,
    experience: 5,
    height: 165,
    weight: 55,
    eyeColor: 'Brown',
    hairColor: 'Black',
    skills: ['Acting', 'Voice Acting', 'Dancing', 'Singing', 'Horseback Riding'],
    languages: ['Arabic', 'English', 'French'],
    verified: true,
    nafathVerified: true,
    profileViews: 234,
    activeApplications: 3,
    completedProjects: 12,
    bio: 'Passionate actress with 5 years of experience in theater and television. I specialize in dramatic roles and have a strong background in classical training. I am committed to bringing authentic and compelling performances to every project I undertake.',
    education: [
      { degree: 'Bachelor of Fine Arts', institution: 'King Saud University', year: '2018' },
      { degree: 'Acting Diploma', institution: 'Saudi Theater Academy', year: '2016' },
    ],
    workExperience: [
      {
        title: 'Lead Actress',
        project: 'Drama Series - "Desert Rose"',
        company: 'MBC Studios',
        year: '2024',
        description: 'Played the main protagonist in a 20-episode historical drama series.',
      },
      {
        title: 'Supporting Role',
        project: 'Feature Film - "Echoes of Time"',
        company: 'Independent Production',
        year: '2023',
        description: 'Supporting role in an award-winning independent feature film.',
      },
      {
        title: 'Voice Actor',
        project: 'Animated Series - "Adventures in Arabia"',
        company: 'Manga Productions',
        year: '2022',
        description: 'Voice acting for multiple characters across 12 episodes.',
      },
    ],
    portfolioImages: [
      '/images/talent/portfolio-1.jpg',
      '/images/talent/portfolio-2.jpg',
      '/images/talent/portfolio-3.jpg',
    ],
    demoReelUrl: 'https://youtube.com/watch?v=demo',
    instagramUrl: 'https://instagram.com/saraha',
    availability: 'Available for projects starting November 2025',
    willingToTravel: true,
  };

  return (
    <>
      {user ? <DashboardNav /> : <LandingHeader />}
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/talent" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Talent Search
            </Link>
          </div>
        </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6 text-center">
                {/* Profile Picture */}
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4">
                  {talent.name.charAt(0)}
                </div>

                {/* Name & Verification */}
                <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                  {talent.stageName}
                  {talent.verified && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </h1>
                <p className="text-sm text-muted-foreground mb-2">{talent.name}</p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-semibold text-foreground">{talent.rating}</span>
                  <span className="text-sm text-muted-foreground">({talent.completedProjects} projects)</span>
                </div>

                {/* Nafath Badge */}
                {talent.nafathVerified && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Nafath Verified</span>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-2 mt-6">
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Talent
                  </Button>
                  {talent.demoReelUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={talent.demoReelUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Demo Reel
                      </a>
                    </Button>
                  )}
                  {talent.instagramUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={talent.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">At a Glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">{talent.experience} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profile Views</span>
                  <span className="font-medium text-foreground">{talent.profileViews}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Applications</span>
                  <span className="font-medium text-foreground">{talent.activeApplications}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Willing to Travel</span>
                  <span className="font-medium text-foreground">{talent.willingToTravel ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Physical Attributes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Physical Attributes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Age</p>
                  <p className="font-medium text-foreground">{talent.age} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Gender</p>
                  <p className="font-medium text-foreground">{talent.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Height</p>
                  <p className="font-medium text-foreground">{talent.height} cm</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Weight</p>
                  <p className="font-medium text-foreground">{talent.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Eye Color</p>
                  <p className="font-medium text-foreground">{talent.eyeColor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Hair Color</p>
                  <p className="font-medium text-foreground">{talent.hairColor}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{talent.bio}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{talent.location}</span>
                </div>
                {talent.availability && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{talent.availability}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {talent.languages.map((language, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {talent.workExperience.map((work, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold text-foreground">{work.title}</h4>
                    <p className="text-sm text-primary font-medium">{work.project}</p>
                    <p className="text-sm text-muted-foreground">{work.company} • {work.year}</p>
                    <p className="text-sm text-foreground mt-2">{work.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {talent.education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

