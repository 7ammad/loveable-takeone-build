'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Briefcase, Shield } from 'lucide-react';

type RegistrationStep = 'role' | 'details' | 'verification';
type UserRole = 'talent' | 'caster';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: selectedRole,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white">
              Take<span className="text-primary">One</span>
            </h1>
          </Link>
          <p className="mt-2 text-gray-400">Join Saudi Arabia's premier casting marketplace</p>
        </div>

        {/* Registration Card */}
        <div className="bg-card rounded-xl shadow-xl p-8 border border-border">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['role', 'details', 'verification'].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step
                        ? 'bg-primary text-primary-foreground'
                        : index < ['role', 'details', 'verification'].indexOf(currentStep)
                        ? 'bg-primary/50 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < ['role', 'details', 'verification'].indexOf(currentStep)
                          ? 'bg-primary/50'
                          : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Role</span>
              <span>Details</span>
              <span>Verify</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-6">
            {currentStep === 'role' && 'Choose Your Path'}
            {currentStep === 'details' && 'Create Your Account'}
            {currentStep === 'verification' && 'Verify Your Identity'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">I want to...</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Talent Card */}
                <button
                  onClick={() => handleRoleSelect('talent')}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                    selectedRole === 'talent'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <UserIcon className="w-12 h-12 text-primary mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Find Work</h3>
                  <p className="text-sm text-muted-foreground">
                    I'm a talent looking for casting opportunities
                  </p>
                </button>

                {/* Caster Card */}
                <button
                  onClick={() => handleRoleSelect('caster')}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                    selectedRole === 'caster'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Briefcase className="w-12 h-12 text-primary mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Hire Talent</h3>
                  <p className="text-sm text-muted-foreground">
                    I'm a caster looking to hire talented individuals
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Account Details */}
          {currentStep === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="pl-10"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="At least 8 characters"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className="pl-10"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep('role')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Continue'}
                </Button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

