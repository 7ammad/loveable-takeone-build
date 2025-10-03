'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Lock, 
  Bell,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                          </label>
                          <Input placeholder="Sarah Al-Ahmed" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Stage Name
                          </label>
                          <Input placeholder="Sarah A." />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <Input type="email" placeholder="sarah@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <Input type="tel" placeholder="+966 5X XXX XXXX" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Bio
                        </label>
                        <textarea
                          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <Button>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Confirm New Password
                        </label>
                        <Input type="password" placeholder="Confirm new password" />
                      </div>
                      <Button>Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Nafath Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Verified</p>
                            <p className="text-sm text-green-700">Your identity has been verified via Nafath</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Verification expires on: December 31, 2025
                      </p>
                      <Button variant="outline">Renew Verification</Button>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { id: 'email_applications', label: 'Application Updates', description: 'Get notified when your application status changes' },
                      { id: 'email_messages', label: 'New Messages', description: 'Receive emails for new messages from hirers' },
                      { id: 'email_casting', label: 'New Casting Calls', description: 'Get notified about new opportunities matching your profile' },
                      { id: 'email_marketing', label: 'Marketing Emails', description: 'Receive updates about new features and tips' },
                    ].map((option) => (
                      <div key={option.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { id: 'profile_public', label: 'Public Profile', description: 'Make your profile visible to hirers' },
                      { id: 'show_email', label: 'Show Email', description: 'Display your email address on your profile' },
                      { id: 'show_phone', label: 'Show Phone', description: 'Display your phone number on your profile' },
                      { id: 'allow_messages', label: 'Allow Messages', description: 'Let hirers send you direct messages' },
                    ].map((option) => (
                      <div key={option.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Language
                      </label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                        <option value="en">English</option>
                        <option value="ar">العربية (Arabic)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Timezone
                      </label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                        <option value="Asia/Riyadh">Arabia Standard Time (Riyadh)</option>
                        <option value="Asia/Dubai">Gulf Standard Time (Dubai)</option>
                      </select>
                    </div>
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

